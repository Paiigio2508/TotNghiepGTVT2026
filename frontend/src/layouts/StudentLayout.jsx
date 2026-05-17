
import { Layout, Menu, Button, FloatButton, Badge, Dropdown, List, notification } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  MessageOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { FaClock, FaHome, FaUserGraduate } from "react-icons/fa";
import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import ChatWidget from "../components/ChatWidget";
import { ChatAPI } from "../api/ChatAPI";
import { NotificationAPI } from "../api/NotificationAPI";
import { connectSocket } from "../socket/chatSocket";
import { LuNotepadText } from "react-icons/lu";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Header, Sider, Content } = Layout;

export default function StudentLayout() {

  const [collapsed, setCollapsed] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [openChat, setOpenChat] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const location = useLocation();
  const nav = useNavigate();

  const userData = JSON.parse(localStorage.getItem("userData"));

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("userData");
      nav("/login", { replace: true });
    }
  };

  /* ================= ICON THEO TYPE ================= */

  const getIcon = (type) => {

    switch (type) {
      case "DEADLINE_CREATED":
        return "⏰";

      case "WEEKLY_REPORT_GRADED":
        return "⭐";

      case "TOPIC_APPROVED_BY_TEACHER":
        return "📚";

      default:
        return "🔔";
    }
  };

  /* ================= LOAD CHAT ROOM ================= */

  useEffect(() => {

    if (!userData?.userId) return;

    const fetchRoom = async () => {

      try {

        const res = await ChatAPI.getRoomByStudent(userData.userId);

        const room = res.data?.data || res.data;

        if (room?.id) {
          setRoomId(room.id);
        }

      } catch (err) {
        console.error(err);
      }

    };

    fetchRoom();

  }, []);

  /* ================= LOAD NOTIFICATION ================= */

  useEffect(() => {

    if (!userData?.userId) return;

    const loadNotifications = async () => {

      try {

        const res = await NotificationAPI.getByUser(userData.userId);
        setNotifications(res.data);

        const countRes = await NotificationAPI.countUnread(userData.userId);
        setUnreadCount(countRes.data);

      } catch (err) {
        console.error(err);
      }

    };

    loadNotifications();

  }, []);

  /* ================= SOCKET ================= */

  useEffect(() => {

    if (!userData?.userId) return;

    connectSocket(
      roomId,
      userData.userId,


      /* NOTIFICATION */
      (notificationData) => {

        setNotifications((prev) => [notificationData, ...prev]);
        setUnreadCount((prev) => prev + 1);

        /* POPUP */

        notification.open({
          message: notificationData.title,
          description: notificationData.content,
          placement: "topRight",
        });

      }

    );

  }, [roomId]);

  /* ================= CLICK NOTIFICATION ================= */

  const handleClickNotification = async (item) => {

    try {

      await NotificationAPI.markRead(item.id);

      setUnreadCount((prev) => Math.max(prev - 1, 0));

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === item.id ? { ...n, isRead: true } : n
        )
      );

    } catch (err) {
      console.error(err);
    }

  };

  /* ================= DROPDOWN ================= */

  const notificationMenu = (
    <List
      style={{ width: 340, maxHeight: 420, overflow: "auto" }}
      dataSource={notifications}
      locale={{ emptyText: "Không có thông báo" }}
      renderItem={(item) => (

        <List.Item
          onClick={() => handleClickNotification(item)}
          style={{
            cursor: "pointer",
            background: item.isRead ? "#fff" : "#f6f6f6",
            borderRadius: 8,
            marginBottom: 6,
            padding: 10
          }}
        >

          <div style={{ display: "flex", gap: 10, width: "100%" }}>

            <div style={{ fontSize: 20 }}>
              {getIcon(item.type)}
            </div>

            <div style={{ flex: 1 }}>

              <div style={{ fontWeight: 600 }}>
                {item.title}
              </div>

              <div style={{ fontSize: 12, color: "#666" }}>
                {item.content}
              </div>

              <div style={{ fontSize: 11, color: "#999", marginTop: 3 }}>
                {dayjs(item.createdAt).fromNow()}
              </div>

            </div>

            {!item.isRead && (
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#1677ff",
                  marginTop: 6
                }}
              />
            )}

          </div>

        </List.Item>

      )}
    />
  );

  return (

    <Layout style={{ minHeight: "100vh" }}>

      <Sider collapsible collapsed={collapsed} trigger={null} width={220}>

        <div
          style={{
            height: collapsed ? 80 : 160,
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >

          <img
            src={userData?.avatar || "https://i.pravatar.cc/150"}
            alt="avatar"
            style={{
              width: collapsed ? 45 : 90,
              height: collapsed ? 45 : 90,
              borderRadius: "50%",
              objectFit: "cover",
              border: "3px solid #fff",
            }}
          />

          {!collapsed && (
            <span
              style={{
                marginTop: 10,
                fontWeight: "bold",
                fontSize: 14,
              }}
            >
              {userData?.username}
            </span>
          )}

        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={studentMenu}
          onClick={({ key }) => nav(key)}
        />

      </Sider>

      <Layout>

        <Header
          style={{
            background: "#4E4336",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >

          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>

            <Dropdown trigger={["click"]} dropdownRender={() => notificationMenu}>
              <Badge count={unreadCount}>
                <BellOutlined
                  style={{ fontSize: 20, color: "#fff", cursor: "pointer" }}
                />
              </Badge>
            </Dropdown>

            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Đăng xuất
            </Button>

          </div>

        </Header>

        <Content style={{ padding: 16 }}>
          <Outlet />
        </Content>

      </Layout>

      {openChat && roomId && (
        <ChatWidget
          roomId={roomId}
          studentName="Giảng viên"
          mode="popup"
          onClose={() => setOpenChat(false)}
        />
      )}

      <FloatButton
        icon={<MessageOutlined />}
        onClick={() => setOpenChat(!openChat)}
      />

      <FloatButton.BackTop />

    </Layout>
  );
}

const studentMenu = [
  { key: "/student", icon: <FaUserGraduate />, label: "Thông tin" },
  { key: "/student/topic", icon: <FaHome />, label: "Đề tài" },
  { key: "/student/deadlines", icon: <FaClock />, label: "Deadlines" },
  {
    key: "/student/scores",
    icon: <LuNotepadText />,
    label: "Bảng điểm theo tuần",
  },
];

