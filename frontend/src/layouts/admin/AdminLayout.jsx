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
import { FaHome, FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";
import { BsBoxSeamFill } from "react-icons/bs";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;
const { SubMenu } = Menu; 

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const nav = useNavigate();

  return (
    <Layout style={{ minHeight: "100vh" }}>
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
        >
          <Menu.Item
            key="/admin"
            icon={<FaHome />}
            onClick={() => nav("/admin")}
          >
            Dashboard
          </Menu.Item>

          <SubMenu
            key="product"
            icon={<BsBoxSeamFill size={20} />}
            title="Người dùng"
          >
            <Menu.Item
              key="/admin/students"
              icon={<FaUserGraduate />}
              onClick={() => nav("/admin/students")}
            >
              Sinh viên
            </Menu.Item>

            <Menu.Item
              key="/admin/teachers"
              icon={<FaChalkboardTeacher />}
              onClick={() => nav("/admin/teachers")}
            >
              Giảng viên
            </Menu.Item>
          </SubMenu>

          <Menu.Item
            key="/admin/hoc-ky"
            icon={<FaHome />}
            onClick={() => nav("/admin/hoc-ky")}
          >
            Học kỳ
          </Menu.Item>

          <Menu.Item
            key="/admin/phan-cong"
            icon={<FaHome />}
            onClick={() => nav("/admin/phan-cong")}
          >
            Phân công
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header style={{ background: "#4E4336" }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
        </Header>

        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>

      <FloatButton.BackTop />
    </Layout>
  );
}
