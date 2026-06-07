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
  Radio,
  DatePicker,
  Select,
} from "antd";
import { RetweetOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { FaChalkboardTeacher } from "react-icons/fa";
import { TeacherAPI } from "../../api/TeacherAPI";
import "./css/UserManage.css";
import UpLoadImage from "../UpLoadImage";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const { Option } = Select;

export default function TeacherManage() {
  const [data, setData] = useState([]);
  const [dataGoc, setDataGoc] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const [searchForm] = Form.useForm();
  const [modalForm] = Form.useForm();

  /* ================= LOAD DATA ================= */
  const loadTeacher = async () => {
    try {
      const res = await TeacherAPI.getAll();
      console.log("🚀 ~ loadTeacher ~ res:", res);
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

    const key = keyword.trim().toLowerCase();

    const result = dataGoc.filter(
      (item) =>
        item.userCode?.toLowerCase().includes(key) ||
        item.name?.toLowerCase().includes(key) ||
        item.phone?.toLowerCase().includes(key)
    );

    setData(result);
  };

  /* ================= DELETE / UPDATE STATUS ================= */
  const onDelete = async (id) => {
    try {
      await TeacherAPI.updateTT(id);
      toast.success("Cập nhật giảng viên thành công!");
      loadTeacher();
    } catch {
      toast.error("Cập nhật trạng thái thất bại!");
    }
  };

  /* ================= CLOSE MODAL ================= */
  const handleCloseModal = () => {
    setOpen(false);
    setEditing(null);
    setImageUrl(null);
    modalForm.resetFields();
  };

  /* ================= ADD ================= */
  const onAdd = () => {
    setEditing(null);
    setImageUrl(null);
    modalForm.resetFields();
    modalForm.setFieldsValue({
      role: "TEACHER",
    });
    setOpen(true);
  };

  /* ================= EDIT ================= */
  const onEdit = (record) => {
    setEditing(record);
    setImageUrl(record.urlImage);

    modalForm.setFieldsValue({
      userCode: record.userCode,
      name: record.name,
      role: record.role || "TEACHER",
      gender: record.gender,
      ngaySinh: record.ngaySinh ? dayjs(record.ngaySinh) : null,
      email: record.email,
      phone: record.phone,
      urlImage: record.urlImage,
    });

    setOpen(true);
  };

  /* ================= SUBMIT ================= */
  const onSubmit = async () => {
    try {
      const values = await modalForm.validateFields();

      const payload = {
        userCode: values.userCode?.trim(),
        fullName: values.name?.trim().replace(/\s+/g, " "),
        phone: values.phone?.trim() || null,
        email: values.email?.trim(),
        urlImage: values.urlImage,
        gender: values.gender,
        role: values.role,
        ngaySinh: values.ngaySinh
          ? values.ngaySinh.format("YYYY-MM-DD")
          : null,
      };

      let res;

      if (editing) {
        res = await TeacherAPI.updateTeacher(editing.id, payload);
      } else {
        res = await TeacherAPI.createTeacher(payload);
      }

      if (res.data && res.data.success === false) {
        toast.error(res.data.message);
        return;
      }

      toast.success(editing ? "Cập nhật thành công!" : "Thêm thành công!");

      handleCloseModal();
      loadTeacher();
    } catch (err) {
      // Validate lỗi thì không hiện toast "Lỗi hệ thống"
      if (err?.errorFields) {
        return;
      }

      toast.error(err?.response?.data?.message || "Lỗi hệ thống!");
    }
  };

  /* ================= COLUMNS ================= */
  const columns = [
    {
      title: "Mã GV",
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
          fallback="https://i.pinimg.com/736x/bc/43/98/bc439871417621836a0eeea768d60944.jpg"
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
          "-"
        ),
    },
    {
      title: "Ngày sinh",
      dataIndex: "ngaySinh",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : ""),
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "SĐT",
      dataIndex: "phone",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      render: (role) => {
        if (role === "HEAD_OF_DEPARTMENT") {
          return <Tag color="gold">Trưởng bộ môn</Tag>;
        }
        return <Tag color="blue">Giảng viên</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) =>
        status == 0 ? (
          <Tag color="#00cc00">Hoạt động</Tag>
        ) : (
          <Tag color="red">Ngừng hoạt động</Tag>
        ),
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button onClick={() => onEdit(record)}>Cập nhật</Button>

          <Popconfirm
            title="Cập nhật giảng viên?"
            onConfirm={() => onDelete(record.id)}
          >
            <Button danger>UpdateTT</Button>
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
                placeholder="Mã / tên / SĐT..."
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

      <Space className="float-end mt-4 mb-4">
        <Button type="primary" onClick={onAdd}>
          Thêm giảng viên
        </Button>
      </Space>

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

      <Modal
        open={open}
        title={editing ? "Sửa giảng viên" : "Thêm giảng viên"}
        onCancel={handleCloseModal}
        onOk={onSubmit}
        width={1000}
        centered
      >
        <Row gutter={24}>
          <Col span={10} className="d-flex justify-content-center pt-5">
            <UpLoadImage
              defaultImage={imageUrl}
              onFileUpload={(url) => {
                setImageUrl(url);
                modalForm.setFieldsValue({ urlImage: url });
              }}
            />
          </Col>

          <Col span={14}>
            <Form form={modalForm} layout="vertical">
              <Form.Item
                name="userCode"
                label="Mã giảng viên"
                rules={[
                  {
                    required: true,
                    message: "Không được để trống!",
                  },
                ]}
              >
                <Input maxLength={30} placeholder="Nhập mã giảng viên" />
              </Form.Item>

              <Form.Item
                name="name"
                label="Họ tên"
                validateFirst
                rules={[
                  {
                    required: true,
                    message: "Không được để trống!",
                  },
                  {
                    validator: (_, value) => {
                      // Để required xử lý lỗi trống, tránh bị duplicate message
                      if (!value || value.trim() === "") {
                        return Promise.resolve();
                      }

                      // Chỉ cho chữ cái tiếng Việt và khoảng trắng
                      const nameRegex = /^[\p{L}]+(?:\s+[\p{L}]+)*$/u;

                      if (!nameRegex.test(value.trim())) {
                        return Promise.reject(
                          new Error(
                            "Họ tên chỉ được chứa chữ cái, không được chứa số hoặc ký tự đặc biệt!"
                          )
                        );
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input maxLength={100} placeholder="Nhập họ tên giảng viên" />
              </Form.Item>

              <Form.Item
                name="role"
                label="Vai trò"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn vai trò!",
                  },
                ]}
              >
                <Select placeholder="Chọn vai trò">
                  <Option value="TEACHER">Giảng viên</Option>
                  <Option value="HEAD_OF_DEPARTMENT">Trưởng bộ môn</Option>
                </Select>
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
                    required: true,
                    message: "Vui lòng chọn ngày sinh!",
                  },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày sinh"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  {
                    required: true,
                    message: "Không được để trống!",
                  },
                  {
                    type: "email",
                    message: "Email không đúng định dạng!",
                  },
                ]}
              >
                <Input maxLength={100} placeholder="Nhập email" />
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
                <Input maxLength={10} placeholder="Nhập số điện thoại" />
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