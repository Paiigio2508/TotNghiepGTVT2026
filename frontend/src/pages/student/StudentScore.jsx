import { Layout, Table, Tag, message, Card, Statistic } from "antd";
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
    const data = Array.isArray(res.data) ? res.data : [];
    setScore(data);
  } catch (error) {
    message.error("Tải score thất bại!");
  }
};
  // ⭐ tính điểm trung bình
  const averageScore =
    score.length > 0
      ? (
          score.reduce((sum, item) => sum + Number(item.score), 0) /
          score.length
        ).toFixed(2)
      : 0;

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

      {/* Điểm trung bình */}

      <Table
        columns={columns}
        dataSource={score}
        rowKey="week"
        pagination={false}
        bordered
      />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 20,
        }}
      >
        <Card style={{ width: 250 }}>
          <Statistic
            title="Điểm trung bình"
            value={averageScore}
            suffix="/ 10"
          />
        </Card>
      </div>
    </Layout>
  );
}
