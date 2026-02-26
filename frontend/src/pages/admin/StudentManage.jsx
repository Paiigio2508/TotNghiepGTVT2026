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
  Tag,
  Upload,
} from "antd";

import {
  SyncOutlined,
  EditOutlined,
  RetweetOutlined,
  UploadOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

import { useState, useEffect } from "react";
import { FaUserGraduate } from "react-icons/fa";
import { StudentAPI } from "../../api/StudentAPI";
import "./css/UserManage.css";
import UpLoadImage from "../UpLoadImage";
import { toast } from "react-toastify";

export default function StudentManage() {
  const [data, setData] = useState([]);
  const [dataGoc, setDataGoc] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [form] = Form.useForm();
  const [importFile, setImportFile] = useState(null);

  /* =========================
     LOAD DATA
  ========================= */
  const loadStudent = async () => {
    try {
      const res = await StudentAPI.getAll();
      setData(res.data);
      setDataGoc(res.data);
    } catch (err) {
      message.error("Tải danh sách sinh viên thất bại!");
    }
  };

  useEffect(() => {
    loadStudent();
  }, []);

  /* =========================
     SEARCH
  ========================= */
  const handleSearch = (keyword) => {
    if (!keyword || keyword.trim() === "") {
      setData(dataGoc);
      return;
    }

    const ketQua = dataGoc.filter(
      (item) =>
        item.userCode?.toLowerCase().includes(keyword.toLowerCase()) ||
        item.name?.toLowerCase().includes(keyword.toLowerCase()) ||
        item.className?.toLowerCase().includes(keyword.toLowerCase()) ||
        item.phone?.toLowerCase().includes(keyword.toLowerCase())
    );

    setData(ketQua);
  };

  /* =========================
     DELETE
  ========================= */
  const onDelete = async (id) => {
    try {
      await StudentAPI.deleteStudent(id);
      toast.success("Cập nhật trạng thái thành công!");
      loadStudent();
    } catch (err) {
      toast.error("Cập nhật trạng thái thất bại!");
    }
  };

  /* =========================
     EDIT
  ========================= */
  const onEdit = (record) => {
    setEditing(record);
    setImageUrl(record.urlImage);
    form.setFieldsValue(record);
    setOpen(true);
  };

  /* =========================
     SUBMIT
  ========================= */
  const onSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        userCode: values.userCode,
        fullName: values.name,
        className: values.className,
        phone: values.phone,
        email: values.email,
        urlImage: values.urlImage,
      };

      let res;

      if (editing) {
        res = await StudentAPI.updateStudent(editing.id, payload);
      } else {
        res = await StudentAPI.createStudent(payload);
      }

      if (res.data?.success === false) {
        toast.error(res.data.message);
        return;
      }

      toast.success(editing ? "Cập nhật thành công!" : "Thêm thành công!");

      setOpen(false);
      form.resetFields();
      setImageUrl(null);
      setEditing(null);
      loadStudent();
    } catch (err) {
      toast.error("Lỗi hệ thống!");
    }
  };

  /* =========================
     IMPORT EXCEL
  ========================= */
  const handleImport = async () => {
    if (!importFile) {
      toast.warning("Vui lòng chọn file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", importFile);

    try {
      const res = await StudentAPI.importStudent(formData);
      toast.success(res.data);
      setImportFile(null);
      loadStudent();
    } catch (err) {
      toast.error(err.response?.data?.message || "Import thất bại");
    }
  };

  /* =========================
     COLUMNS
  ========================= */
  const columns = [
    { title: "Mã SV", dataIndex: "userCode" },
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
    { title: "Lớp", dataIndex: "className" },
    { title: "Email", dataIndex: "email" },
    { title: "SĐT", dataIndex: "phone" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) =>
        status == "DU_DIEU_KIEN" ? (
          <Tag color="#00cc00">Đủ điều kiện</Tag>
        ) : (
          <Tag color="red">Không đủ điều kiện</Tag>
        ),
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button onClick={() => onEdit(record)} icon={<EditOutlined />}>
            Sửa
          </Button>

          <Popconfirm
            title="Đổi trạng thái sinh viên?"
            onConfirm={() => onDelete(record.id)}
          >
            <Button
              icon={
                record.status === "DU_DIEU_KIEN" ? (
                  <CloseCircleOutlined />
                ) : (
                  <CheckCircleOutlined />
                )
              }
              type={record.status === "DU_DIEU_KIEN" ? "default" : "primary"}
              danger={record.status === "DU_DIEU_KIEN"}
            >
              {record.status === "DU_DIEU_KIEN"
                ? "Không đủ điều kiện"
                : "Đủ điều kiện"}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Divider titlePlacement="center">
        <h2 className="fw-bold">
          <FaUserGraduate /> Quản lý sinh viên
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
                className="w-100"
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

      {/* IMPORT + ADD */}
      <Space className="float-end mt-4 mb-4">
        <Upload
          accept=".xlsx"
          maxCount={1}
          beforeUpload={(file) => {
            setImportFile(file);
            return false; // không upload tự động
          }}
          onRemove={() => setImportFile(null)}
        >
          <Button icon={<UploadOutlined />}>Chọn file Excel</Button>
        </Upload>

        <Button type="primary" onClick={handleImport}>
          Import
        </Button>

        <Button
          type="primary"
          onClick={() => {
            setEditing(null);
            form.resetFields();
            setOpen(true);
            setImageUrl(null);
          }}
        >
          Thêm sinh viên
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
        title={editing ? "Sửa sinh viên" : "Thêm sinh viên"}
        onCancel={() => setOpen(false)}
        footer={null}
        width={1000}
      >
        <Row gutter={24}>
          <Col span={10} className="d-flex justify-content-center pt-5">
            <UpLoadImage
              defaultImage={imageUrl}
              onFileUpload={(url) => {
                setImageUrl(url);
                form.setFieldsValue({ urlImage: url });
              }}
            />
          </Col>

          <Col span={14}>
            <Form form={form} layout="vertical" onFinish={onSubmit}>
              <Form.Item
                name="userCode"
                label="Mã sinh viên"
                rules={[{ required: true }, { pattern: /^[0-9]{7}$/ }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="name"
                label="Họ tên"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="className"
                label="Lớp"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true }, { type: "email" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item name="phone" label="SĐT">
                <Input />
              </Form.Item>

              <Form.Item name="urlImage" hidden>
                <Input />
              </Form.Item>

              <Button type="primary" htmlType="submit">
                {editing ? "Cập nhật" : "Thêm"}
              </Button>
            </Form>
          </Col>
        </Row>
      </Modal>
    </>
  );
}
