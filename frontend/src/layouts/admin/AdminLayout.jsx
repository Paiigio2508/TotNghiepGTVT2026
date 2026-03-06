import { Layout, Menu, Button, FloatButton } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { FaHome, FaUserGraduate, FaChalkboardTeacher, FaBook, FaGraduationCap } from "react-icons/fa";
import { BsBoxSeamFill } from "react-icons/bs";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./AdminLayout.css";
import { LuNotepadText } from "react-icons/lu";

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const nav = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("userData");
      nav("/login", { replace: true });
    }
  };

  return (
    <Layout className="layout" style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} trigger={null} width={220}>
        <div
          style={{
            height: 64,
            color: "#fff",
            textAlign: "center",
            lineHeight: "64px",
            fontWeight: "bold",
          }}
        >
          {collapsed ? "AD" : "ADMIN PANEL"}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={["product"]}
          items={menuItems}
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
            lineHeight: "48px",
            padding: "0 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            type="text"
            className="menu-toggle-btn"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />

          {/* 🔥 Logout Button */}
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Đăng xuất
          </Button>
        </Header>

        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>

      <FloatButton.BackTop />
    </Layout>
  );
}

const menuItems = [
  {
    key: "/admin",
    icon: <FaHome />,
    label: "Dashboard",
  },
  {
    key: "product",
    icon: <BsBoxSeamFill size={20} />,
    label: "Người dùng",
    children: [
      {
        key: "/admin/students",
        icon: <FaUserGraduate />,
        label: "Sinh viên",
      },
      {
        key: "/admin/teachers",
        icon: <FaChalkboardTeacher />,
        label: "Giảng viên",
      },
    ],
  },
  {
    key: "/admin/hoc-ky",
    icon: <FaGraduationCap />,
    label: "Học kỳ thực tập",
  },
  {
    key: "/admin/topic",
    icon: <FaBook />,
    label: "Danh sách đề tài",
  },
  {
    key: "/admin/socres",
    icon: <LuNotepadText />,
    label: "Danh sách điểm",
  },
];
