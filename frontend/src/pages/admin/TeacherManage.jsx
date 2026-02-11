import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
  Divider,
  Image,
  Row,
  Col,
  Tag
} from "antd";
import { RetweetOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { FaChalkboardTeacher } from "react-icons/fa";
import { TeacherAPI } from "../../api/TeacherAPI";
import "./css/UserManage.css";
import UpLoadImage from "../UpLoadImage";
import { toast } from "react-toastify";

export default function TeacherManage() {
  const [data, setData] = useState([]);
  const [dataGoc, setDataGoc] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [form] = Form.useForm();

  /* ================= LOAD DATA ================= */
  const loadTeacher = async () => {
    try {
      const res = await TeacherAPI.getAll();
      setData(res.data);
      setDataGoc(res.data);
    } catch (err) {
      message.error("Tải danh sách giảng viên thất bại!");
    }
  };

  useEffect(() => {
    loadTeacher();
  }, []);

  /* ================= SEARCH ================= */
  const handleSearch = (keyword) => {
    if (!keyword || keyword.trim() === "") {
      setData(dataGoc);
      return;
    }

    const result = dataGoc.filter(
      (item) =>
        item.userCode?.toLowerCase().includes(keyword.toLowerCase()) ||
        item.name?.toLowerCase().includes(keyword.toLowerCase()) ||
        item.phone?.toLowerCase().includes(keyword.toLowerCase())
    );

    setData(result);
  };

  /* ================= DELETE ================= */
  const onDelete = async (id) => {
    try {
      await TeacherAPI.deleteTeacher(id);
      toast.success("Cập nhật giảng viên thành công!");
      loadTeacher();
    } catch {
      toast.error("Xóa thất bại!");
    }
  };

  /* ================= EDIT ================= */
  const onEdit = (record) => {
    setEditing(record);
    setImageUrl(record.urlImage);
    form.setFieldsValue(record);
    setOpen(true);
  };

  /* ================= SUBMIT ================= */
  const onSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        userCode: values.userCode,
        fullName: values.name,
        phone: values.phone,
        email: values.email,
        urlImage: values.urlImage,
      };

      if (editing) {
  
        await TeacherAPI.updateTeacher(editing.id, payload);
        toast.success("Cập nhật thành công!");
      } else {
        
        await TeacherAPI.createTeacher(payload);
        toast.success("Thêm thành công!");
      }

      setOpen(false);
      form.resetFields();
      setImageUrl(null);
      setEditing(null);
      loadTeacher();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= COLUMNS ================= */
  const columns = [
    { title: "Mã GV", dataIndex: "userCode" },
    {
      title: "Ảnh",
      dataIndex: "urlImage",
      render: (url) => (
        <Image
          src={url}
          width={70}
          height={70}
          style={{ objectFit: "cover", borderRadius: "50%" }}
          fallback="https://via.placeholder.com/70"
        />
      ),
    },
    { title: "Họ tên", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "SĐT", dataIndex: "phone" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => (
        <>
          {status == 0 ? (
            <Tag color="#00cc00">Hoạt động</Tag>
          ) : (
            <Tag color="red">Ngừng hoạt động</Tag>
          )}
        </>
      ),
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button onClick={() => onEdit(record)}>Sửa</Button>
          <Popconfirm
            title="Xóa giảng viên?"
            onConfirm={() => onDelete(record.id)}
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Divider titlePlacement="center">
        <h2 className="fw-bold">
          <FaChalkboardTeacher /> Quản lý giảng viên
        </h2>
      </Divider>

      {/* SEARCH */}
      <div className="form-header">
        <Form
          form={form}
          onValuesChange={(changedValues) =>
            handleSearch(changedValues.timKiem)
          }
        >
          <div className="d-flex justify-content-center gap-4">
            <Form.Item label="Tìm kiếm" name="timKiem" className="ant-input">
              <Input
                maxLength={30}
                placeholder="Mã / tên / SĐT..."
                allowClear
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                icon={<RetweetOutlined />}
                onClick={() => {
                  form.resetFields();
                  setData(dataGoc);
                }}
              >
                Làm mới
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>

      {/* ADD BUTTON */}
      <Space className="float-end mt-4 mb-4">
        <Button
          type="primary"
          onClick={() => {
            setEditing(null);
            form.resetFields();
            setOpen(true);
            setImageUrl(null);
          }}
        >
          Thêm giảng viên
        </Button>
      </Space>

      {/* TABLE */}
      <Table
        className="custom-table"
        dataSource={data}
        columns={columns}
        rowKey="id"
        pagination={{
          showQuickJumper: true,
          defaultPageSize: 5,
        }}
      />

      {/* MODAL */}
      <Modal
        open={open}
        title={editing ? "Sửa giảng viên" : "Thêm giảng viên"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        width={1000}
      >
        <Row gutter={24}>
          {/* Upload ảnh */}
          <Col span={10} className="d-flex justify-content-center pt-5">
            <UpLoadImage
              defaultImage={imageUrl}
              onFileUpload={(url) => {
                setImageUrl(url);
                form.setFieldsValue({ urlImage: url });
              }}
            />
          </Col>

          {/* Form */}
          <Col span={14}>
            <Form form={form} layout="vertical">
              <Form.Item
                name="userCode"
                label="Mã giảng viên"
                rules={[{ required: true, message: "Không được để trống!" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="name"
                label="Họ tên"
                rules={[{ required: true, message: "Không được để trống!" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Không được để trống!" },
                  { type: "email", message: "Email không đúng định dạng!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="phone"
                label="SĐT"
                rules={[
                  {
                    pattern: /^0[0-9]{9}$/,
                    message: "SĐT phải gồm 10 số và bắt đầu bằng 0!",
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item name="urlImage" hidden>
                <Input />
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Modal>
    </>
  );
}
