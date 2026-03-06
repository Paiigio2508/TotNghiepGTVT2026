import { Layout, Menu, Button, FloatButton } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { FaBookDead, FaClock, FaHome, FaUserGraduate } from "react-icons/fa";
import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import ChatWidget from "../components/ChatWidget";
import { ChatAPI } from "../api/ChatAPI";
import { LuNotepadText } from "react-icons/lu";

const { Header, Sider, Content } = Layout;

export default function StudentLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [openChat, setOpenChat] = useState(false);

  const location = useLocation();
  const nav = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData"));

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("userData");
      nav("/login", { replace: true });
    }
  };

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

          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Đăng xuất
          </Button>
        </Header>

        <Content style={{ padding: 16 }}>
          <Outlet />
        </Content>
      </Layout>

      {/* CHAT POPUP */}
      {openChat && roomId && (
        <ChatWidget
          roomId={roomId}
          studentName="Giảng viên"
          mode="popup"
          onClose={() => setOpenChat(false)}
        />
      )}

      {/* FLOAT CHAT BUTTON */}
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
  { key: "/student/topic", icon: <FaHome />, label: "Đăng ký đề tài" },
  { key: "/student/deadlines", icon: <FaClock />, label: "Deadlines" },
  {
    key: "/student/scores",
    icon: <LuNotepadText />,
    label: "Bảng điểm theo tuần ",
  },
];
