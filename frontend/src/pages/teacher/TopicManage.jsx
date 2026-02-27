import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  Divider,
  Row,
  Col,
  InputNumber,
  message,
} from "antd";
import { useState } from "react";
import { FaBook } from "react-icons/fa";

const { TextArea } = Input;

export default function TopicManage() {
  const [data, setData] = useState([]);
  const [dataGoc, setDataGoc] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  // 🔥 Giảng viên local (fix cứng)
  const teacherLocal = {
    id: 1,
    name: "Nguyễn Văn A",
  };

  /* ================= SEARCH ================= */
  const handleSearch = (keyword) => {
    if (!keyword || keyword.trim() === "") {
      setData(dataGoc);
      return;
    }

    const result = dataGoc.filter(
      (item) =>
        item.title?.toLowerCase().includes(keyword.toLowerCase()) ||
        item.description?.toLowerCase().includes(keyword.toLowerCase())
    );

    setData(result);
  };

  /* ================= SUBMIT ================= */
  const onSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        id: editing ? editing.id : Date.now(),
        title: values.title,
        description: values.description,
        maxStudents: values.maxStudents,

        // truyền thẳng giảng viên local
        teacher: {
          id: teacherLocal.id,
          name: teacherLocal.name,
        },
      };

      if (editing) {
        const updated = data.map((item) =>
          item.id === editing.id ? payload : item
        );
        setData(updated);
        setDataGoc(updated);
        message.success("Cập nhật thành công!");
      } else {
        const newData = [...data, payload];
        setData(newData);
        setDataGoc(newData);
        message.success("Thêm thành công!");
      }

      setOpen(false);
      form.resetFields();
      setEditing(null);
    } catch (err) {
      message.error("Vui lòng kiểm tra lại dữ liệu!");
    }
  };

  /* ================= DELETE ================= */
  const onDelete = (id) => {
    const newData = data.filter((item) => item.id !== id);
    setData(newData);
    setDataGoc(newData);
    message.success("Xóa thành công!");
  };

  /* ================= EDIT ================= */
  const onEdit = (record) => {
    setEditing(record);
    form.setFieldsValue(record);
    setOpen(true);
  };

  /* ================= COLUMNS ================= */
  const columns = [
    { title: "Tên đề tài", dataIndex: "title" },
    { title: "Mô tả", dataIndex: "description" },
    { title: "Số SV tối đa", dataIndex: "maxStudents" },
    {
      title: "Giảng viên",
      render: (_, record) => record.teacher?.name,
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button onClick={() => onEdit(record)}>Sửa</Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
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
      <Divider>
        <h2 className="fw-bold">
          <FaBook /> Quản lý đề tài
        </h2>
      </Divider>

      {/* SEARCH */}
      <div className="form-header">
        <Form
          onValuesChange={(changedValues) =>
            handleSearch(changedValues.timKiem)
          }
        >
          <div className="d-flex justify-content-center gap-4">
            <Form.Item label="Tìm kiếm" name="timKiem">
              <Input
                maxLength={50}
                placeholder="Tên đề tài / Mô tả..."
                allowClear
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                onClick={() => {
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
      <Space className="mb-4 mt-3">
        <Button
     
          type="primary"
          onClick={() => {
            setEditing(null);
            form.resetFields();
            setOpen(true);
          }}
        >
          Thêm đề tài
        </Button>
      </Space>

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
        title={editing ? "Sửa đề tài" : "Thêm đề tài"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        width={700}
        centered
      >
        <Row gutter={24}>
          <Col span={24}>
            <Form form={form} layout="vertical">
              <Form.Item
                name="title"
                label="Tên đề tài"
                rules={[{ required: true, message: "Không được để trống!" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: "Không được để trống!" }]}
              >
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item
                name="maxStudents"
                label="Số lượng sinh viên tối đa"
                rules={[{ required: true, message: "Không được để trống!" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Modal>
    </>
  );
}
