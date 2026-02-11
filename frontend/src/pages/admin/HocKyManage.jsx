import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  Divider,
  message,
  Tag,
} from "antd";
import { RetweetOutlined, EditOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { FaHome } from "react-icons/fa";
import { TermAPI } from "../../api/TermAPI";
import { DatePicker } from "antd";
import dayjs from "dayjs";
// import "./css/UserManage.css";

export default function HocKyManage() {
  const [data, setData] = useState([]);
  const [dataGoc, setDataGoc] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

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
        item.year?.toLowerCase().includes(keyword.toLowerCase())
    );

    setData(result);
  };

  /* ================= DELETE ================= */
  const onDelete = async (id) => {
    try {
      await TermAPI.delete(id);
      message.success("Xóa thành công!");
      loadHocKy();
    } catch (err) {
      message.error("Xóa thất bại!");
    }
  };

  /* ================= EDIT ================= */
  const onEdit = (record) => {
    setEditing(record);
    form.setFieldsValue(record);
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
      };
      if (editing) {
        await TermAPI.update(editing.id, values);
        message.success("Cập nhật thành công!");
      } else {
        console.log(payload);
        // await TermAPI.create(payload);
        message.success("Thêm thành công!");
      }

      setOpen(false);
      form.resetFields();
      setEditing(null);
      loadHocKy();
    } catch (err) {
      console.error(err);
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
      dataIndex: "year",
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
      render: (status) =>
        status === 0 ? (
          <Tag color="green">Đang hoạt động</Tag>
        ) : (
          <Tag color="red">Đã khóa</Tag>
        ),
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => onEdit(record)}>
            Sửa
          </Button>

          <Popconfirm title="Xóa học kỳ?" onConfirm={() => onDelete(record.id)}>
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
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên học kỳ"
            rules={[{ required: true, message: "Không được để trống!" }]}
          >
            <Input placeholder="Ví dụ: Học kỳ 1" />
          </Form.Item>

          <Form.Item
            name="year"
            label="Năm học"
            rules={[
              { required: true, message: "Không được để trống!" },
              {
                pattern: /^[0-9]{4}-[0-9]{4}$/,
                message: "Định dạng năm phải dạng 2024-2025",
              },
            ]}
          >
            <Input placeholder="Ví dụ: 2024-2025" />
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: "Chọn ngày bắt đầu!" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="Ngày kết thúc"
            dependencies={["startDate"]}
            rules={[
              { required: true, message: "Chọn ngày kết thúc!" },
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

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Nhập mô tả học kỳ..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
