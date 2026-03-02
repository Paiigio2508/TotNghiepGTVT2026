import { Card, Avatar, Typography, Tag, Dropdown, Space, Badge } from "antd";
import { FileTextOutlined, MoreOutlined, EyeOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { DeadlineAPI } from "../../api/DeadlineAPI";

const { Text } = Typography;

export default function StudentDeadlineList() {
  const navigate = useNavigate();
const [deadlines, setDeadlines] = useState([]);
  // 🔥 DATA FAKE
  const [userId, setUserId] = useState(null);
   useEffect(() => {
     const userData = localStorage.getItem("userData");
     if (userData) {
       const parsed = JSON.parse(userData);
       setUserId(parsed.userId);
     }
   }, []);

useEffect(() => {
  const loadDeadlines = async () => {
    try {
      const res = await DeadlineAPI.getByStudent(userId);
      setDeadlines(Array.isArray(res.data) ? res.data : []);
    } catch {
      message.error("Tải deadline thất bại!");
    }
  };

  if (userId) loadDeadlines();
}, [userId]);
  const getStatusTag = (status, dueDate) => {
    const isExpired = dayjs().isAfter(dayjs(dueDate));

    if (status === "SUBMITTED") {
      return <Tag color="green">Đã nộp</Tag>;
    }

    if (status === "LATE") {
      return <Tag color="orange">Nộp trễ</Tag>;
    }

    if (isExpired) {
      return <Tag color="red">Quá hạn</Tag>;
    }

    return <Tag color="blue">Chưa nộp</Tag>;
  };

  return (
    <div style={{ maxWidth: 850, margin: "0 auto" }}>
      {deadlines.map((item) => {
        const isExpired = dayjs().isAfter(dayjs(item.dueDate));

        const menuItems = [
          {
            key: "1",
            icon: <EyeOutlined />,
            label: "Xem chi tiết",
            onClick: () => navigate(`/student/deadlines/${item.id}`),
          },
        ];

        return (
          <Card
            key={item.id}
            hoverable
            onClick={() => navigate(`/student/deadlines/${item.id}`)}
            style={{
              marginBottom: 18,
              borderRadius: 16,
              backgroundColor: "#f5f7fa",
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
            bodyStyle={{ padding: 20 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              {/* ICON */}
              <Avatar
                size={52}
                style={{
                  backgroundColor: "#2e7d32",
                  marginRight: 16,
                }}
                icon={<FileTextOutlined />}
              />

              {/* CONTENT */}
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontSize: 16 }}>
                  Giảng viên đã đăng một deadline mới:
                </Text>

                <div style={{ marginTop: 4 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      color: "#1677ff",
                    }}
                  >
                    Tuần {item.weekNo} - {item.title}
                  </Text>
                </div>

                <div style={{ marginTop: 6 }}>
                  <Text type="secondary">
                    Hạn nộp: {dayjs(item.dueDate).format("DD MMM YYYY • HH:mm")}
                  </Text>
                </div>

                <div style={{ marginTop: 8 }}>
                  <Space>
                    {getStatusTag(item.status, item.dueDate)}

                    {isExpired && item.status !== "SUBMITTED" && (
                      <Badge
                        count="!"
                        style={{
                          backgroundColor: "#ff4d4f",
                        }}
                      />
                    )}
                  </Space>
                </div>
              </div>

              {/* 3 DOT MENU */}
              <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
                <MoreOutlined
                  style={{
                    fontSize: 20,
                    color: "#666",
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </Dropdown>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
