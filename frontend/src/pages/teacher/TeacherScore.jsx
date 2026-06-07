import { useEffect, useState } from "react";
import { Table, Select, Card, message, Button } from "antd";
import { ScoreAPI } from "../../api/ScoreAPI";
import { TermAPI } from "../../api/TermAPI";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

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
      if (term.status === "DANG_DIEN_RA") return true;
      if (term.status === "Đang diễn ra") return true;

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

      tableData.forEach((row) => {
        let sum = 0;

        weeks.forEach((w) => {
          sum += Number(row[`week${w}`] || 0);
        });

        row.avg = weeks.length > 0 ? (sum / weeks.length).toFixed(2) : "0.00";
      });

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

      const weekColumns = weeks.map((w) => ({
        title: `W${w}`,
        dataIndex: `week${w}`,
        align: "center",
        width: 80,
        render: (score) => score ?? "-",
      }));

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

  /* ================= EXPORT EXCEL ================= */

  const handleExportExcel = () => {
    if (!data || data.length === 0) {
      message.warning("Không có dữ liệu để xuất!");
      return;
    }

    const selectedTerm = terms.find((t) => t.id === termId);

    const weekColumns = columns.filter(
      (col) =>
        typeof col.dataIndex === "string" && col.dataIndex.startsWith("week")
    );

    const exportRows = data.map((row, index) => {
      const item = {
        STT: index + 1,
        "Mã sinh viên": row.studentCode || "",
        "Họ tên sinh viên": row.studentName || "",
        "Tên đề tài": row.topicTitle || "",
      };

      weekColumns.forEach((col) => {
        item[col.title] = row[col.dataIndex] ?? "-";
      });

      item["Điểm trung bình"] = row.avg ?? "0.00";

      return item;
    });

    const titleRows = [
      ["BẢNG ĐIỂM SINH VIÊN"],
      [
        `Kỳ: ${
          selectedTerm
            ? `${selectedTerm.name} (${selectedTerm.academicYear})`
            : ""
        }`,
      ],
      [`Giảng viên: ${user?.fullName || user?.username || ""}`],
      [`Ngày xuất: ${dayjs().format("DD/MM/YYYY HH:mm")}`],
      [],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(titleRows);

    XLSX.utils.sheet_add_json(worksheet, exportRows, {
      origin: "A6",
      skipHeader: false,
    });

    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 18 },
      { wch: 28 },
      { wch: 45 },
      ...weekColumns.map(() => ({ wch: 10 })),
      { wch: 18 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bang diem");

    const termName = selectedTerm?.name
      ? selectedTerm.name.replace(/[\\/:*?"<>|]/g, "")
      : "ky_thuc_tap";

    const fileName = `Bang_diem_${termName}_${dayjs().format(
      "YYYYMMDD_HHmm"
    )}.xlsx`;

    XLSX.writeFile(workbook, fileName);

    toast.success("Xuất bảng điểm thành công!");
  };

  return (
<Card title="📊 Bảng điểm sinh viên">
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
      gap: 12,
      flexWrap: "wrap",
    }}
  >
    <Select
      value={termId}
      style={{ width: 250 }}
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

    <Button
      type="primary"
      onClick={handleExportExcel}
      disabled={!data.length}
    >
      Xuất Excel
    </Button>
  </div>

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