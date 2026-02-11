import {
  Layout,
  Menu,
  Button,
  FloatButton,
} from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { FaHome, FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";
import { BsBoxSeamFill } from "react-icons/bs";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./AdminLayout.css";
const { Header, Sider, Content } = Layout;


export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const nav = useNavigate();

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
        <Header style={{ background: "#4E4336" }}>
          <Button
            type="text"
            className="menu-toggle-btn"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
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
    icon: <FaHome />,
    label: "Học kỳ",
  },
  {
    key: "/admin/phan-cong",
    icon: <FaHome />,
    label: "Phân công",
  },
];
