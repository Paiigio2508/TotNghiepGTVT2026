import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Divider,
  message,
  Tag,
} from "antd";
import { useNavigate } from "react-router-dom";
import { RetweetOutlined, EditOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { FaHome } from "react-icons/fa";
import { TermAPI } from "../../api/TermAPI";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { toast } from "react-toastify";

export default function HocKyManage() {
  const [data, setData] = useState([]);
  const [dataGoc, setDataGoc] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  /* ================= LOAD ================= */
  const loadHocKy = async () => {
    try {
      const res = await TermAPI.getAll();
      setData(res.data);
      setDataGoc(res.data);

    } catch (err) {
      message.error("Tải danh sách học kỳ thất bại!");
    }
  };

  useEffect(() => {
    loadHocKy();
  }, []);

  /* ================= SEARCH ================= */
  const handleSearch = (keyword) => {
    if (!keyword || keyword.trim() === "") {
      setData(dataGoc);
      return;
    }

    const result = dataGoc.filter(
      (item) =>
        item.name?.toLowerCase().includes(keyword.toLowerCase()) ||
        item.academicYear?.toLowerCase().includes(keyword.toLowerCase())
    );

    setData(result);
  };

  /* ================= EDIT ================= */
  const onEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      startDate: dayjs(record.startDate),
      endDate: dayjs(record.endDate),
      registrationDeadline: record.registrationDeadline
        ? dayjs(record.registrationDeadline)
        : null,
    });
    setOpen(true);
  };

  /* ================= SUBMIT ================= */
  const onSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        ...values,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        registrationDeadline: values.registrationDeadline.format("YYYY-MM-DD"),
      };

      let res;

      if (editing) {
        res = await TermAPI.update(editing.id, payload);
      } else {
        res = await TermAPI.create(payload);
      }

      // 👇 CHECK success ở đây
      if (res.data.success === false) {
        toast.error(res.data.message);
        return; // DỪNG LUÔN, không hiện success
      }

      toast.success(editing ? "Cập nhật thành công!" : "Thêm thành công!");

      setOpen(false);
      form.resetFields();
      setEditing(null);
      loadHocKy();
    } catch (err) {
      console.error("Lỗi hệ thống:", err);
      toast.error("Không kết nối được server!");
    }
  };

  /* ================= STATUS ================= */
  const renderStatus = (status) => {
    switch (status) {
      case "SAP_DIEN_RA":
        return <Tag color="blue">Sắp diễn ra</Tag>;
      case "DANG_DIEN_RA":
        return <Tag color="green">Đang diễn ra</Tag>;
      case "KET_THUC":
        return <Tag color="red">Kết thúc</Tag>;
      default:
        return <Tag>Không xác định</Tag>;
    }
  };

  /* ================= COLUMNS ================= */
  const columns = [
    {
      title: "Tên học kỳ",
      dataIndex: "name",
    },
    {
      title: "Năm học",
      dataIndex: "academicYear",
    },
    {
      title: "Hạn đăng ký đề tài",
      dataIndex: "registrationDeadline",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
    },
    {
      title: "Bắt đầu",
      dataIndex: "startDate",
    },
    {
      title: "Kết thúc",
      dataIndex: "endDate",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: renderStatus,
    },
    {
      title: "Hành động",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            danger
            size="small"
            onClick={() =>
              navigate(`/admin/assignments/${record.id}`, {
                state: { term: record },
              })
            }
          >
            Phân công
          </Button>

          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(record);
            }}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Divider titlePlacement="center">
        <h2 className="fw-bold">
          <FaHome /> Quản lý học kỳ
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
            <Form.Item label="Tìm kiếm" name="timKiem">
              <Input placeholder="Tên học kỳ / Năm học..." allowClear />
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
          }}
        >
          Thêm học kỳ
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
        title={editing ? "Sửa học kỳ" : "Thêm học kỳ"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên học kỳ"
            rules={[{ required: true, message: "Không được để trống!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="academicYear"
            label="Năm học"
            rules={[
              { required: true },
              {
                pattern: /^[0-9]{4}-[0-9]{4}$/,
                message: "Định dạng năm phải dạng 2024-2025",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="Ngày kết thúc"
            dependencies={["startDate"]}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const start = getFieldValue("startDate");
                  if (!value || !start || value.isAfter(start)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Ngày kết thúc phải sau ngày bắt đầu!")
                  );
                },
              }),
            ]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item
            name="registrationDeadline"
            label="Hạn đăng ký đề tài"
            rules={[
              { required: true, message: "Vui lòng chọn hạn đăng ký!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const start = getFieldValue("startDate");
                  const end = getFieldValue("endDate");

                  if (!value || !start || !end) {
                    return Promise.resolve();
                  }

                  if (value.isBefore(start)) {
                    return Promise.reject(
                      new Error("Hạn đăng ký phải sau ngày bắt đầu!")
                    );
                  }

                  if (value.isAfter(end)) {
                    return Promise.reject(
                      new Error("Hạn đăng ký phải trước ngày kết thúc!")
                    );
                  }

                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
