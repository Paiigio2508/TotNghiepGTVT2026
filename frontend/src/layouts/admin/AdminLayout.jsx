import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  FloatButton,
} from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { FaHome, FaUserPen } from "react-icons/fa";
import { RxDashboard } from "react-icons/rx";
import { BsBoxSeamFill } from "react-icons/bs";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./AdminSidebar.css";

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const nav = useNavigate();

  return (
    <div>
      {" "}
      <h1 style={{ color: "red" }}>ADMIN LAYOUT OK</h1>
      <Outlet />
    </div>

    // <Layout style={{ minHeight: "100vh" }}>
    //   <Sider
    //     collapsible
    //     collapsed={collapsed}
    //     trigger={null}
    //     width={235}
    //     theme="dark"
    //   >
    //     <div style={{ padding: 20, textAlign: "center", color: "white" }}>
    //       {collapsed ? "AD" : "ADMIN PANEL"}
    //     </div>

    //     <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]}>
    //       <Menu.Item
    //         key="/admin"
    //         icon={<FaHome />}
    //         onClick={() => nav("/admin")}
    //       >
    //         Trang chủ
    //       </Menu.Item>

    //       <Menu.Item
    //         key="/admin/students"
    //         icon={<FaUserPen />}
    //         onClick={() => nav("/admin/students")}
    //       >
    //         Sinh viên
    //       </Menu.Item>

    //       <Menu.Item
    //         key="/admin/teachers"
    //         icon={<RxDashboard />}
    //         onClick={() => nav("/admin/teachers")}
    //       >
    //         Giảng viên
    //       </Menu.Item>
    //     </Menu>
    //   </Sider>

    //   <Layout>
    //     <Header
    //       style={{
    //         background: "#4E4336",
    //         display: "flex",
    //         alignItems: "center",
    //         justifyContent: "space-between",
    //         padding: "0 16px",
    //       }}
    //     >
    //       <Button
    //         type="text"
    //         icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
    //         onClick={() => setCollapsed(!collapsed)}
    //       />

    //       <Dropdown
    //         menu={{
    //           items: [
    //             {
    //               key: "logout",
    //               label: "Đăng xuất",
    //             },
    //           ],
    //         }}
    //       >
    //         <Space>
    //           <Avatar />
    //           <span style={{ color: "#fff" }}>Admin</span>
    //         </Space>
    //       </Dropdown>
    //     </Header>

    //     <Content style={{ padding: 24 }}>
    //       <Outlet />
    //     </Content>
    //   </Layout>

    //   <FloatButton.BackTop />
    // </Layout>
  );
}
