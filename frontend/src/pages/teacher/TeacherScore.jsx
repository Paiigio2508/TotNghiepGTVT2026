import { useEffect, useState } from "react";
import { Table, Select, Card } from "antd";
import { ScoreAPI } from "../../api/ScoreAPI";
import { TermAPI } from "../../api/TermAPI";

const { Option } = Select;

export default function TeacherScore() {
  const [terms, setTerms] = useState([]);
  const [termId, setTermId] = useState(null);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  const user = JSON.parse(localStorage.getItem("userData"));

  useEffect(() => {
    loadTerms();
  }, []);

  useEffect(() => {
    if (termId) {
      loadScore();
    }
  }, [termId]);

  const loadTerms = async () => {
    const res = await TermAPI.getAllTermForTeacherLayout();
    setTerms(res.data);
  };

  const loadScore = async () => {
    const res = await ScoreAPI.getScoreStudentforTeacher(user.userId, termId);

    const rows = res.data;

    const weeks = [...new Set(rows.map((r) => r.week))].sort((a, b) => a - b);

    const map = {};

    rows.forEach((r) => {
      if (!map[r.studentId]) {
        map[r.studentId] = {
          key: r.studentId,
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
        sum += row[`week${w}`] || 0;
      });

      row.avg = (sum / weeks.length).toFixed(2);
    });

    const baseColumns = [
      {
        title: "Tên",
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
            {text}
          </div>
        ),
      },
    ];

    const weekColumns = weeks.map((w) => ({
      title: `W${w}`,
      dataIndex: `week${w}`,
      align: "center",
    }));

    const avgColumn = {
      title: "Avg",
      dataIndex: "avg",
      align: "center",
    };

    setColumns([...baseColumns, ...weekColumns, avgColumn]);
    setData(tableData);
  };

  return (
    <Card title="📊 Bảng điểm sinh viên">
      <Select
        style={{ width: 250, marginBottom: 20 }}
        placeholder="Chọn kỳ thực tập"
        onChange={(v) => setTermId(v)}
      >
        {terms.map((t) => (
          <Option key={t.id} value={t.id}>
            {t.name}
          </Option>
        ))}
      </Select>

      <Table columns={columns} dataSource={data} pagination={false} bordered />
    </Card>
  );
}
