import { Layout, Table, Tag, message } from "antd";
import { useEffect, useState } from "react";
import { ScoreAPI } from "../../api/ScoreAPI";

export default function StudentScore() {
  const [userId, setUserId] = useState(null);
  const [score, setScore] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem("userData");

    if (userData) {
      const parsed = JSON.parse(userData);
      setUserId(parsed.userId);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      loadScore();
    }
  }, [userId]);

  const loadScore = async () => {
    try {
      const res = await ScoreAPI.getScoreByStudent(userId);
      setScore(res.data);
    } catch (error) {
      message.error("Tải score thất bại!");
    }
  };

  const columns = [
    {
      title: "Tuần",
      dataIndex: "week",
      key: "week",
      align: "center",
      width: 100,
    },
    {
      title: "Nội dung",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Điểm",
      dataIndex: "score",
      key: "score",
      align: "center",
      render: (score) => (
        <Tag color={score >= 8 ? "green" : score >= 5 ? "orange" : "red"}>
          {score}
        </Tag>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (note) => note || "Chưa có nhận xét",
    },
  ];

  return (
    <Layout style={{ padding: "24px", background: "#fff" }}>
      <h2 style={{ marginBottom: 20 }}>📊 Bảng điểm sinh viên</h2>

      <Table
        columns={columns}
        dataSource={score}
        rowKey="week"
        pagination={false}
        bordered
      />
    </Layout>
  );
}
