import { Layout, Menu, Button, FloatButton } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { FaHome, FaUserGraduate } from "react-icons/fa";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;

export default function TeacherLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const nav = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData"));
  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("userData");
      nav("/login", { replace: true });
    }
  };

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
          onClick={({ key }) => {
            if (key.startsWith("/")) {
              nav(key);
            }
          }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#4E4336",
            height: "48px",
            padding: "0 16px",
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

      <FloatButton.BackTop />
    </Layout>
  );
}

const teacherMenu = [
  {
    key: "/teacher",
    icon: <FaHome />,
    label: "Dashboard",
  },
  {
    key: "/teacher/students",
    icon: <FaUserGraduate />,
    label: "Sinh viên hướng dẫn",
  },
];
