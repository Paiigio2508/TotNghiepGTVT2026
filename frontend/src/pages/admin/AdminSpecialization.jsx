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
  Tag,
} from "antd";

import {
  EditOutlined,
  DeleteOutlined,
  RetweetOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import { SpecializationAPI } from "../../api/SpecializationAPI";
import { toast } from "react-toastify";

export default function AdminSpecialization() {
  const [data, setData] = useState([]);
  const [dataGoc, setDataGoc] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();

  /* ================= LOAD ================= */

  const loadData = async () => {
    try {
      const res = await SpecializationAPI.getAll();
      const raw = Array.isArray(res.data) ? res.data : [];
      setData(raw);
      setDataGoc(raw);
    } catch {
      message.error("Tải danh sách thất bại!");
      setData([]);
      setDataGoc([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= SEARCH ================= */

  const handleSearch = (keyword) => {
    if (!keyword || keyword.trim() === "") {
      setData(dataGoc);
      return;
    }

    const tuKhoa = keyword.toLowerCase();

    const ketQua = dataGoc.filter(
      (item) =>
        item.name?.toLowerCase().includes(tuKhoa) ||
        item.description?.toLowerCase().includes(tuKhoa) ||
        String(item.status ?? "")
          .toLowerCase()
          .includes(tuKhoa),
    );

    setData(ketQua);
  };

  /* ================= UPDATE STATUS ================= */

  const onDelete = async (id) => {
    try {
      await SpecializationAPI.updateTT(id);
      toast.success("Cập nhật trạng thái thành công!");
      loadData();
    } catch {
      toast.error("Cập nhật trạng thái thất bại!");
    }
  };

  /* ================= EDIT ================= */

  const onEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
    });
    setOpen(true);
  };

  /* ================= SUBMIT ================= */

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        ...values,
      };

      let res;

      if (editing) {
        res = await SpecializationAPI.updateSpecialization(editing.id, payload);
      } else {
        res = await SpecializationAPI.createSpecialization(payload);
      }

      if (res?.data?.success === false) {
        const msg = res?.data?.message || "Có lỗi xảy ra!";
        toast.error(msg);

        if (msg.toLowerCase().includes("tồn tại")) {
          form.setFields([
            {
              name: "name",
              errors: [msg],
            },
          ]);
        }
        return;
      }

      toast.success(editing ? "Cập nhật thành công!" : "Thêm thành công!");
      setOpen(false);
      form.resetFields();
      setEditing(null);
      loadData();
    } catch (error) {
      console.log(error);

      const msg =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        "Lỗi!";

      toast.error(msg);
    }
  };

  /* ================= TABLE ================= */

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 70,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên",
      dataIndex: "name",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) =>
        status === 0 ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Ngừng</Tag>
        ),
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => onEdit(record)}>
            Sửa
          </Button>

          <Popconfirm
            title="Cập nhật trạng thái chuyên ngành?"
            onConfirm={() => onDelete(record.id)}
          >
            <Button danger icon={<DeleteOutlined />}>
              UpdateTT
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Divider>
        <h2>Quản lý chuyên ngành</h2>
      </Divider>

      {/* SEARCH */}
      <div className="form-header ">
        <Form
          form={searchForm}
          onValuesChange={(changedValues) =>
            handleSearch(changedValues.timKiem)
          }
        >
          <div className="d-flex justify-content-center gap-4">
            <Form.Item label="Tìm kiếm" name="timKiem">
              <Input
                maxLength={50}
                placeholder="Tên / mô tả / trạng thái..."
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

      {/* ADD BUTTON */}
      <Button
        type="primary"
        onClick={() => {
          setEditing(null);
          form.resetFields();
          setOpen(true);
        }}
        className="float-end mt-4"
        style={{ marginBottom: 16 }}
      >
        Thêm chuyên ngành
      </Button>

      {/* TABLE */}
      <Table
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
        title={editing ? "Sửa chuyên ngành" : "Thêm chuyên ngành"}
        onCancel={() => {
          setOpen(false);
          setEditing(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Form.Item
            name="name"
            label="Tên chuyên ngành"
            rules={[
              { required: true, message: "Vui lòng nhập tên chuyên ngành" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Button type="primary" htmlType="submit">
            {editing ? "Cập nhật" : "Thêm"}
          </Button>
        </Form>
      </Modal>
    </>
  );
}
