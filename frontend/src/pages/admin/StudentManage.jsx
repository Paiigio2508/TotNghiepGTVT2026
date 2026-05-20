import { useState, useEffect } from "react";
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
  Radio,
  DatePicker,
} from "antd";

import {
  EditOutlined,
  RetweetOutlined,
  UploadOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

import { FaUserGraduate } from "react-icons/fa";
import { StudentAPI } from "../../api/StudentAPI";
import "./css/UserManage.css";
import UpLoadImage from "../UpLoadImage";
import { toast } from "react-toastify";
import dayjs from "dayjs";

export default function StudentManage() {
  const [data, setData] = useState([]);
  const [dataGoc, setDataGoc] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [importFile, setImportFile] = useState(null);

  const [searchForm] = Form.useForm();
  const [studentForm] = Form.useForm();

  /* ================= LOAD DATA ================= */

  const loadStudent = async () => {
    try {
      const res = await StudentAPI.getAll();

      const studentList = Array.isArray(res.data) ? res.data : [];

      setData(studentList);
      setDataGoc(studentList);
    } catch {
      message.error("Tải danh sách sinh viên thất bại!");
    }
  };

  useEffect(() => {
    loadStudent();
  }, []);

  /* ================= SEARCH ================= */

  const handleSearch = (keyword) => {
    if (!keyword || keyword.trim() === "") {
      setData(dataGoc);
      return;
    }

    const lowerKeyword = keyword.toLowerCase();

    const ketQua = dataGoc.filter(
      (item) =>
        item.userCode?.toLowerCase().includes(lowerKeyword) ||
        item.name?.toLowerCase().includes(lowerKeyword) ||
        item.className?.toLowerCase().includes(lowerKeyword) ||
        item.phone?.toLowerCase().includes(lowerKeyword) ||
        item.email?.toLowerCase().includes(lowerKeyword)
    );

    setData(ketQua);
  };

  /* ================= DELETE / CHANGE STATUS ================= */

  const onDelete = async (id) => {
    try {
      await StudentAPI.deleteStudent(id);
      toast.success("Cập nhật trạng thái thành công!");
      loadStudent();
    } catch {
      toast.error("Cập nhật trạng thái thất bại!");
    }
  };

  /* ================= EDIT ================= */

  const onEdit = (record) => {
    setEditing(record);
    setImageUrl(record.urlImage);

    studentForm.setFieldsValue({
      ...record,
      ngaySinh: record.ngaySinh ? dayjs(record.ngaySinh) : null,
      urlImage: record.urlImage || null,
    });

    setOpen(true);
  };

  /* ================= VALIDATE DATE ================= */

  const disabledBirthDate = (current) => {
    // Ngày sinh không được lớn hơn ngày hiện tại
    return current && current.isAfter(dayjs(), "day");
  };

  const validateBirthDate = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Vui lòng chọn ngày sinh!"));
    }

    if (value.isAfter(dayjs(), "day")) {
      return Promise.reject(
        new Error("Ngày sinh không được lớn hơn ngày hiện tại!")
      );
    }

    return Promise.resolve();
  };

  /* ================= SUBMIT ================= */

  const onSubmit = async () => {
    try {
      const values = await studentForm.validateFields();

      const payload = {
        userCode: values.userCode,
        fullName: values.name,
        className: values.className,
        phone: values.phone,
        email: values.email,
        urlImage: values.urlImage,
        gender: values.gender,
        ngaySinh: values.ngaySinh
          ? values.ngaySinh.format("YYYY-MM-DD")
          : null,
      };

      let res;

      if (editing) {
        res = await StudentAPI.updateStudent(editing.id, payload);
      } else {
        res = await StudentAPI.createStudent(payload);
      }

      if (res.data?.success === false) {
        toast.error(res.data.message || "Thao tác thất bại!");
        return;
      }

      toast.success(editing ? "Cập nhật thành công!" : "Thêm thành công!");

      setOpen(false);
      studentForm.resetFields();
      setImageUrl(null);
      setEditing(null);

      loadStudent();
    } catch (error) {
      // Nếu là lỗi validate form thì không hiện lỗi hệ thống
      if (error?.errorFields) return;

      toast.error("Lỗi hệ thống!");
    }
  };

  /* ================= IMPORT ================= */

  const handleImport = async () => {
    if (!importFile) {
      toast.warning("Vui lòng chọn file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", importFile);

    try {
      const res = await StudentAPI.importStudent(formData);

      toast.success(res.data || "Import thành công!");
      setImportFile(null);
      loadStudent();
    } catch (err) {
      toast.error(err.response?.data?.message || "Import thất bại!");
    }
  };

  /* ================= COLUMNS ================= */

  const columns = [
    {
      title: "Mã SV",
      dataIndex: "userCode",
    },
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
    {
      title: "Họ tên",
      dataIndex: "name",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      render: (gender) =>
        gender === "Nam" ? (
          <Tag color="blue">Nam</Tag>
        ) : gender === "Nữ" ? (
          <Tag color="pink">Nữ</Tag>
        ) : (
          <Tag>Không rõ</Tag>
        ),
    },
    {
      title: "Ngày sinh",
      dataIndex: "ngaySinh",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Lớp",
      dataIndex: "className",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "SĐT",
      dataIndex: "phone",
      render: (phone) => phone || "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) =>
        status === "DU_DIEU_KIEN" ? (
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
            okText="Đồng ý"
            cancelText="Hủy"
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
          form={searchForm}
          onValuesChange={(changedValues) =>
            handleSearch(changedValues.timKiem)
          }
        >
          <div className="d-flex justify-content-center gap-4">
            <Form.Item label="Tìm kiếm" name="timKiem">
              <Input
                maxLength={30}
                placeholder="Mã / tên / SĐT / email..."
                allowClear
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                icon={<RetweetOutlined />}
                onClick={() => {
                  searchForm.resetFields();
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
            return false;
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
            studentForm.resetFields();
            setImageUrl(null);
            setOpen(true);
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
        onCancel={() => {
          setOpen(false);
          setEditing(null);
          studentForm.resetFields();
          setImageUrl(null);
        }}
        footer={null}
        width={1000}
        centered
      >
        <Row gutter={24}>
          <Col span={10} className="d-flex justify-content-center pt-5">
            <UpLoadImage
              defaultImage={imageUrl}
              onFileUpload={(url) => {
                setImageUrl(url);
                studentForm.setFieldsValue({ urlImage: url });
              }}
            />
          </Col>

          <Col span={14}>
            <Form form={studentForm} layout="vertical" onFinish={onSubmit}>
              <Form.Item
                name="userCode"
                label="Mã sinh viên"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mã sinh viên!",
                  },
                  {
                    pattern: /^[0-9]{7}$/,
                    message: "Mã sinh viên phải gồm đúng 7 chữ số!",
                  },
                ]}
              >
                <Input placeholder="Nhập mã sinh viên" />
              </Form.Item>

              <Form.Item
                name="name"
                label="Họ tên"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập họ tên!",
                  },
                  {
                    whitespace: true,
                    message: "Họ tên không được chỉ chứa khoảng trắng!",
                  },
                ]}
              >
                <Input placeholder="Nhập họ tên sinh viên" />
              </Form.Item>

              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn giới tính!",
                  },
                ]}
              >
                <Radio.Group>
                  <Radio value="Nam">Nam</Radio>
                  <Radio value="Nữ">Nữ</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="ngaySinh"
                label="Ngày sinh"
                rules={[
                  {
                    validator: validateBirthDate,
                  },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày sinh"
                  disabledDate={disabledBirthDate}
                />
              </Form.Item>

              <Form.Item
                name="className"
                label="Lớp"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập lớp!",
                  },
                  {
                    whitespace: true,
                    message: "Lớp không được chỉ chứa khoảng trắng!",
                  },
                ]}
              >
                <Input placeholder="Nhập lớp" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập email!",
                  },
                  {
                    type: "email",
                    message: "Email không đúng định dạng!",
                  },
                ]}
              >
                <Input placeholder="Nhập email" />
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
                <Input placeholder="Nhập số điện thoại" maxLength={10} />
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