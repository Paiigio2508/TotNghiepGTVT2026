import { Layout, Menu, Button, FloatButton } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
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
  const [selectedRoomId, setSelectedRoomId] = useState(null);

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

    const fetchRooms = async () => {
      try {
        const res = await ChatAPI.getRoomByTeacher(userData.userId);

        if (res.data.success && Array.isArray(res.data.data)) {
          setRooms(res.data.data);
        } else {
          setRooms([]);
        }
      } catch (err) {
        console.error("Lỗi load rooms:", err);
      }
    };

    fetchRooms();
  }, [userData]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} trigger={null} width={220}>
        <div style={{ padding: 20, color: "#fff" }}>
          {!collapsed && <b>{userData?.username}</b>}
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

        <Content style={{ padding: 16 }}>
          <Outlet />

          {/* DANH SÁCH SINH VIÊN CHAT */}
          {rooms.length > 0 && (
            <div style={{ marginBottom: 15 }}>
              <h4>Chọn sinh viên để chat:</h4>
              {rooms.map((room) => (
                <Button
                  key={room.id}
                  style={{ marginRight: 8, marginBottom: 8 }}
                  onClick={() => setSelectedRoomId(room.id)}
                >
                  Room {room.id.slice(0, 6)}
                </Button>
              ))}
            </div>
          )}

          {selectedRoomId && <ChatWidget roomId={selectedRoomId} />}
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
