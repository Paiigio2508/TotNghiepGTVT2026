import { useEffect, useState } from "react";
import { Table, Select, Card, message } from "antd";
import { ScoreAPI } from "../../api/ScoreAPI";
import { TermAPI } from "../../api/TermAPI";
import dayjs from "dayjs";

const { Option } = Select;

export default function TeacherScore() {
  const [terms, setTerms] = useState([]);
  const [termId, setTermId] = useState(null);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("userData"));

  useEffect(() => {
    loadTerms();
  }, []);

  useEffect(() => {
    if (termId) {
      loadScore();
    } else {
      setData([]);
      setColumns([]);
    }
  }, [termId]);

  /* ================= CHECK KỲ ĐANG DIỄN RA ================= */

  const getCurrentTerm = (termList) => {
    const today = dayjs();

    return termList.find((term) => {
      // Ưu tiên status từ backend
      if (term.status === "DANG_DIEN_RA") return true;

      // Nếu backend trả tiếng Việt
      if (term.status === "Đang diễn ra") return true;

      // Nếu status chưa đúng thì check theo ngày
      if (!term.startDate || !term.endDate) return false;

      const startDate = dayjs(term.startDate);
      const endDate = dayjs(term.endDate);

      return (
        !today.isBefore(startDate, "day") &&
        !today.isAfter(endDate, "day")
      );
    });
  };

  /* ================= LOAD TERMS ================= */

  const loadTerms = async () => {
    try {
      const res = await TermAPI.getAllTermForTeacherLayout();

      const termList = res.data || [];
      setTerms(termList);

      if (termList.length > 0) {
        const currentTerm = getCurrentTerm(termList);

        // Ưu tiên kỳ đang diễn ra, nếu không có thì lấy kỳ đầu tiên
        setTermId(currentTerm?.id || termList[0].id);
      }
    } catch {
      message.error("Tải danh sách kỳ thực tập thất bại!");
    }
  };

  /* ================= LOAD SCORE ================= */

  const loadScore = async () => {
    if (!user?.userId || !termId) return;

    try {
      setLoading(true);

      const res = await ScoreAPI.getScoreStudentforTeacher(
        user.userId,
        termId
      );

      const rows = res.data || [];

      if (!rows || rows.length === 0) {
        setData([]);
        setColumns([]);
        return;
      }

      /* ===== LẤY DANH SÁCH TUẦN ===== */

      const weeks = [...new Set(rows.map((r) => r.week))].sort(
        (a, b) => a - b
      );

      const map = {};

      rows.forEach((r) => {
        if (!map[r.studentId]) {
          map[r.studentId] = {
            key: r.studentId,
            studentCode: r.studentCode,
            studentName: r.studentName,
            topicTitle: r.topicTitle,
          };
        }

        map[r.studentId][`week${r.week}`] = r.score;
      });

      const tableData = Object.values(map);

      /* ===== TÍNH AVG ===== */

      tableData.forEach((row) => {
        let sum = 0;

        weeks.forEach((w) => {
          sum += Number(row[`week${w}`] || 0);
        });

        row.avg = weeks.length > 0 ? (sum / weeks.length).toFixed(2) : "0.00";
      });

      /* ===== BASE COLUMNS ===== */

      const baseColumns = [
        {
          title: "Mã SV",
          dataIndex: "studentCode",
          width: 150,
        },
        {
          title: "Sinh viên",
          dataIndex: "studentName",
          width: 250,
        },
        {
          title: "Đề tài",
          dataIndex: "topicTitle",
          width: 350,
          render: (text) => (
            <div
              style={{
                whiteSpace: "normal",
                wordBreak: "break-word",
                lineHeight: "1.4",
              }}
            >
              {text || "-"}
            </div>
          ),
        },
      ];

      /* ===== WEEK COLUMNS ===== */

      const weekColumns = weeks.map((w) => ({
        title: `W${w}`,
        dataIndex: `week${w}`,
        align: "center",
        width: 80,
        render: (score) => score ?? "-",
      }));

      /* ===== AVG COLUMN ===== */

      const avgColumn = {
        title: "Avg",
        dataIndex: "avg",
        align: "center",
        width: 100,
      };

      setColumns([...baseColumns, ...weekColumns, avgColumn]);
      setData(tableData);
    } catch {
      message.error("Tải bảng điểm thất bại!");
      setData([]);
      setColumns([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="📊 Bảng điểm sinh viên">
      <Select
        value={termId}
        style={{ width: 250, marginBottom: 20 }}
        placeholder="Chọn kỳ thực tập"
        allowClear
        onChange={(v) => setTermId(v)}
      >
        {terms.map((t) => (
          <Option key={t.id} value={t.id}>
            {t.name} ({t.academicYear})
          </Option>
        ))}
      </Select>

      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        bordered
        loading={loading}
        scroll={{ x: 1200 }}
      />
    </Card>
  );
}