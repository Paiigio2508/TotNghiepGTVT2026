import { useEffect, useState } from "react";
import { Table, Select, Card, message, Button } from "antd";
import { ScoreAPI } from "../../api/ScoreAPI";
import { TermAPI } from "../../api/TermAPI";
import { TeacherAPI } from "../../api/TeacherAPI";
import dayjs from "dayjs";
import * as XLSX from "xlsx";

const { Option } = Select;

export default function AdminStudentScore() {
  const [terms, setTerms] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [termId, setTermId] = useState(null);
  const [teacherId, setTeacherId] = useState(null);

  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTerms();
    loadTeachers();
  }, []);

  useEffect(() => {
    if (termId && teacherId) {
      loadScore();
    } else {
      setData([]);
      setColumns([]);
    }
  }, [termId, teacherId]);

  /* ================= CURRENT TERM ================= */

  const getCurrentTerm = (termList) => {
    const today = dayjs();

    return termList.find((term) => {
      if (term.status === "DANG_DIEN_RA") return true;
      if (term.status === "Đang diễn ra") return true;

      if (!term.startDate || !term.endDate) return false;

      const startDate = dayjs(term.startDate);
      const endDate = dayjs(term.endDate);

      return !today.isBefore(startDate, "day") && !today.isAfter(endDate, "day");
    });
  };

  /* ================= LOAD TERM ================= */

  const loadTerms = async () => {
    try {
      const res = await TermAPI.getAll();

      const termList = Array.isArray(res.data) ? res.data : [];
      setTerms(termList);

      if (termList.length > 0) {
        const currentTerm = getCurrentTerm(termList);
        setTermId(currentTerm?.id || termList[0].id);
      }
    } catch (error) {
      console.log(error);
      message.error("Không tải được danh sách kỳ");
    }
  };

  /* ================= LOAD TEACHER ================= */

  const loadTeachers = async () => {
    try {
      const res = await TeacherAPI.getAll();
      setTeachers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log(error);
      message.error("Không tải được danh sách giảng viên");
    }
  };

  /* ================= LOAD SCORE ================= */

  const loadScore = async () => {
    try {
      setLoading(true);

      const res = await ScoreAPI.getScoreStudentforAdmin(teacherId, termId);
      const rows = Array.isArray(res.data) ? res.data : [];

      if (rows.length === 0) {
        setData([]);
        setColumns([]);
        return;
      }

      /* ===== LẤY DANH SÁCH WEEK ===== */

      const weeks = [...new Set(rows.map((r) => r.week))]
        .filter((w) => w !== null && w !== undefined)
        .sort((a, b) => a - b);

      /* ===== GROUP DATA THEO STUDENT ===== */

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
        render: (score) =>
          score !== null && score !== undefined ? score : "-",
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
    } catch (err) {
      console.error(err);
      message.error("Không tải được bảng điểm");
      setData([]);
      setColumns([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= EXPORT EXCEL ================= */

  const handleExportExcel = () => {
    if (!termId) {
      message.warning("Vui lòng chọn kỳ thực tập!");
      return;
    }

    if (!teacherId) {
      message.warning("Vui lòng chọn giảng viên!");
      return;
    }

    if (!data || data.length === 0) {
      message.warning("Không có dữ liệu để xuất!");
      return;
    }

    const selectedTerm = terms.find((t) => t.id === termId);
    const selectedTeacher = teachers.find((t) => t.userID === teacherId);

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
      [`Giảng viên: ${selectedTeacher?.name || ""}`],
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

    const teacherName = selectedTeacher?.name
      ? selectedTeacher.name.replace(/[\\/:*?"<>|]/g, "")
      : "giang_vien";

    const fileName = `Bang_diem_${teacherName}_${termName}_${dayjs().format(
      "YYYYMMDD_HHmm"
    )}.xlsx`;

    XLSX.writeFile(workbook, fileName);

    message.success("Xuất bảng điểm thành công!");
  };

  return (
    <Card title="📊 Bảng điểm sinh viên (Admin)">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
          width: "100%",
        }}
      >
        {/* BÊN TRÁI: SELECT */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          {/* TERM SELECT */}
          <div
            style={{
              flex: "1 1 250px",
              minWidth: 250,
              maxWidth: 320,
            }}
          >
            <Select
              value={termId}
              style={{ width: "100%" }}
              placeholder="Chọn kỳ thực tập"
              onChange={(value) => {
                setTermId(value);
                setTeacherId(null);
                setData([]);
                setColumns([]);
              }}
            >
              {terms.map((term) => (
                <Option key={term.id} value={term.id}>
                  {term.name} ({term.academicYear})
                </Option>
              ))}
            </Select>
          </div>

          {/* TEACHER SELECT */}
          <div
            style={{
              flex: "1 1 250px",
              minWidth: 250,
              maxWidth: 320,
            }}
          >
            <Select
              value={teacherId}
              style={{ width: "100%" }}
              placeholder="Chọn giảng viên"
              showSearch
              allowClear
              optionFilterProp="children"
              disabled={!termId}
              onChange={(value) => {
                setTeacherId(value || null);
                setData([]);
                setColumns([]);
              }}
            >
              {teachers.map((teacher) => (
                <Option key={teacher.userID} value={teacher.userID}>
                  {teacher.name}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        {/* BÊN PHẢI: BUTTON */}
        <Button
          type="primary"
          onClick={handleExportExcel}
          disabled={!termId || !teacherId || !data.length}
        >
          Xuất Excel
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={false}
        bordered
        rowKey="key"
        scroll={{ x: 1200 }}
      />
    </Card>
  );
}