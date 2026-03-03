import { Layout, Menu, Button, FloatButton, Avatar } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { FaBookDead, FaHome, FaUserGraduate } from "react-icons/fa";
import { IoIosListBox } from "react-icons/io";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ChatWidget from "../components/ChatWidget";
import { ChatAPI } from "../api/ChatAPI";

const { Header, Sider, Content } = Layout;

export default function TeacherLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const location = useLocation();
  const nav = useNavigate();

  // lấy userData 1 lần duy nhất
  const userData = JSON.parse(localStorage.getItem("userData"));

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("userData");
      nav("/login", { replace: true });
    }
  };

  // gọi API 1 lần khi component mount
useEffect(() => {
  if (!userData?.userId) return;

  const fetchRooms = async () => {
    try {
      const res = await ChatAPI.getRoomByTeacher(userData.userId);
      setRooms(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  fetchRooms();
}, []);   // LUÔN LUÔN []

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <Sider collapsible collapsed={collapsed} trigger={null} width={220}>
        <div
          style={{
            height: collapsed ? 80 : 160,
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transition: "0.3s",
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
              transition: "0.3s",
            }}
          />

          {!collapsed && (
            <span
              style={{
                marginTop: 10,
                fontWeight: "bold",
                fontSize: 14,
                textAlign: "center",
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
          items={teacherMenu}
          onClick={({ key }) => nav(key)}
        />
      </Sider>

      <Layout>
        {/* HEADER */}
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
          <Button danger onClick={handleLogout}>
            Đăng xuất
          </Button>
        </Header>

        {/* CONTENT */}
        <Content style={{ padding: 16 }}>
          <Outlet />

          {/* DANH SÁCH CHAT */}
          {rooms.length > 0 && (
            <div style={{ marginBottom: 25 }}>
              <h4>Chọn sinh viên để chat:</h4>

              {rooms.map((room) => (
                <div
                  key={room.roomId}
                  onClick={() => setSelectedRoom(room)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 10,
                    marginBottom: 8,
                    borderRadius: 12,
                    cursor: "pointer",
                    background:
                      selectedRoom?.roomId === room.roomId
                        ? "#e6f4ff"
                        : "#ffffff",
                    border: "1px solid #f0f0f0",
                    transition: "0.2s",
                  }}
                >
                  <Avatar
                    size={40}
                    src={room.avatar || undefined}
                  >
                    {!room.avatar && room.studentName?.charAt(0)}
                  </Avatar>

                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {room.studentName}
                    </div>
                    <div style={{ fontSize: 13, color: "#888" }}>
                      {room.studentCode}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CHAT BOX */}
          {selectedRoom && (
            <ChatWidget
              roomId={selectedRoom.roomId}
              studentName={selectedRoom.studentName}
            />
          )}
        </Content>
      </Layout>

      <FloatButton.BackTop />
    </Layout>
  );
}

const teacherMenu = [
  { key: "/teacher", icon: <FaHome />, label: "Dashboard" },
  { key: "/teacher/students", icon: <FaUserGraduate />, label: "Sinh viên" },
  { key: "/teacher/topics", icon: <IoIosListBox />, label: "Đề tài" },
  { key: "/teacher/deadlines", icon: <FaBookDead />, label: "Deadlines" },
];