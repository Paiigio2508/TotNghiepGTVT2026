import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
} from "antd";
import { useState } from "react";

export default function StudentManage() {
  const [data, setData] = useState([
    { id: 1, code: "SV001", name: "Nguyễn Văn A", className: "CNTT1" },
    { id: 2, code: "SV002", name: "Trần Thị B", className: "CNTT2" },
  ]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const columns = [
    { title: "Mã SV", dataIndex: "code" },
    { title: "Họ tên", dataIndex: "name" },
    { title: "Lớp", dataIndex: "className" },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button onClick={() => onEdit(record)}>Sửa</Button>
          <Popconfirm
            title="Xóa sinh viên?"
            onConfirm={() => onDelete(record.id)}
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const onAdd = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const onEdit = (record) => {
    setEditing(record);
    form.setFieldsValue(record);
    setOpen(true);
  };

  const onDelete = (id) => {
    setData(data.filter((x) => x.id !== id));
    message.success("Đã xóa");
  };

  const onSubmit = () => {
    form.validateFields().then((values) => {
      if (editing) {
        setData(
          data.map((x) => (x.id === editing.id ? { ...editing, ...values } : x))
        );
        message.success("Đã cập nhật");
      } else {
        setData([...data, { id: Date.now(), ...values }]);
        message.success("Đã thêm");
      }
      setOpen(false);
    });
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={onAdd}>
          Thêm sinh viên
        </Button>
      </Space>

      <Table rowKey="id" columns={columns} dataSource={data} />

      <Modal
        open={open}
        title={editing ? "Sửa sinh viên" : "Thêm sinh viên"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="code"
            label="Mã sinh viên"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Họ tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="className" label="Lớp" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
