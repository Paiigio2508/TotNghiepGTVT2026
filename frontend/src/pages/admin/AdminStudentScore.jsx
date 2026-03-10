import { useEffect, useState } from "react";
import { Table, Select, Card, message, Space } from "antd";
import { ScoreAPI } from "../../api/ScoreAPI";
import { TermAPI } from "../../api/TermAPI";
import { TeacherAPI } from "../../api/TeacherAPI";

const { Option } = Select;

export default function AdminStudentScore() {
  const [terms, setTerms] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [termId, setTermId] = useState(null);
  const [teacherId, setTeacherId] = useState(null);

  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    loadTerms();
    loadTeachers();
  }, []);

  useEffect(() => {
    if (termId && teacherId) {
      loadScore();
    }
  }, [termId, teacherId]);

  const loadTerms = async () => {
    try {
      const res = await TermAPI.getAll();
      setTerms(res.data || []);
    } catch {
      message.error("Không tải được danh sách kỳ");
    }
  };

  const loadTeachers = async () => {
    try {
      const res = await TeacherAPI.getAll();
      setTeachers(res.data || []);
    } catch {
      message.error("Không tải được danh sách giảng viên");
    }
  };

  const loadScore = async () => {
    try {
      const res = await ScoreAPI.getScoreStudentforAdmin(teacherId, termId);

      const rows = res.data;

      if (!rows || rows.length === 0) {
        setData([]);
        setColumns([]);
        return;
      }

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
              {text}
            </div>
          ),
        },
      ];

      const weekColumns = weeks.map((w) => ({
        title: `W${w}`,
        dataIndex: `week${w}`,
        align: "center",
        width: 80,
      }));

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
    }
  };

  return (
    <Card title="📊 Bảng điểm sinh viên (Admin)">
      <Space style={{ marginBottom: 20 }}>
        <Select
          style={{ width: 250 }}
          placeholder="Chọn kỳ thực tập"
          allowClear
          onChange={(v) => setTermId(v)}
        >
          {terms.map((t) => (
            <Option key={t.id} value={t.id}>
              {t.name}
            </Option>
          ))}
        </Select>
        <Select
          style={{ width: 250 }}
          placeholder="Chọn giảng viên"
          showSearch
          optionFilterProp="children"
          allowClear
          onChange={(v) => setTeacherId(v)}
        >
          {teachers.map((t) => (
            <Option key={t.userID} value={t.userID}>
              {t.name}
            </Option>
          ))}
        </Select>

        {/* Term select */}
      </Space>

      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        bordered
        scroll={{ x: 1200 }}
      />
    </Card>
  );
}
