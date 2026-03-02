import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Divider,
  Row,
  Col,
  DatePicker,
  Select,
  Typography,
  Tag,
} from "antd";
import { useState, useEffect } from "react";
import { DeadlineAPI } from "../../api/DeadlineAPI";
import { TermAPI } from "../../api/TermAPI";
import dayjs from "dayjs";
import { toast } from "react-toastify";

const { Title, Text } = Typography;
const { Option } = Select;

export default function DeadlineManage() {
  const [data, setData] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(null);

  const userData = JSON.parse(localStorage.getItem("userData"));
  const userId = userData?.userId;

  /* ================= LOAD TERM ================= */
  useEffect(() => {
    const loadTerms = async () => {
      try {
        const res = await TermAPI.getAllTermForTeacherLayout();
        setTerms(res.data);

        if (res.data.length > 0) {
          setSelectedTerm(res.data[0].id);
        }
      } catch {
        message.error("Tải danh sách học kỳ thất bại!");
      }
    };

    loadTerms();
  }, []);

  /* ================= LOAD DEADLINE ================= */
const loadDeadlines = async () => {
  if (!selectedTerm || !userId) return;

  try {
    setLoading(true);
    const res = await DeadlineAPI.getAll(selectedTerm, userId);

    console.log("Deadline response:", res.data);

    // 🔥 đảm bảo luôn là array
    setData(Array.isArray(res.data) ? res.data : []);
  } catch {
    message.error("Tải deadline thất bại!");
    setData([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadDeadlines();
  }, [selectedTerm, userId]);

  /* ================= SUBMIT ================= */
const onSubmit = async () => {
  try {
    const values = await form.validateFields();

    const payload = {
      weekNo: values.weekNo,
      title: values.title,
      description: values.description,
      dueDate: values.dueDate.format("YYYY-MM-DDTHH:mm:ss"),
      internshipTermId: values.internshipTermId,
    };

    if (editing) {
      await DeadlineAPI.updateDeadline(editing.id, payload, userId);
      toast.success("Cập nhật thành công!");
    } else {
      await DeadlineAPI.createDeadline(payload, userId);
      toast.success("Tạo thành công!");
    }

    setOpen(false);
    setEditing(null);
    form.resetFields();
    loadDeadlines();
  } catch {
    message.error("Lỗi hệ thống!");
  }
};

  const selectedTermName =
    terms.find((term) => term.id === selectedTerm)?.name || "";

  /* ================= COLUMNS ================= */
 const columns = [
   { title: "Tuần", dataIndex: "weekNo" },
   { title: "Tiêu đề", dataIndex: "title" },
   { title: "Mô tả", dataIndex: "description" },
   {
     title: "Hạn nộp",
     dataIndex: "dueDate",
     render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
   },
   {
     title: "Hành động",
     render: (_, record) => (
       <Button
         onClick={() => {
           setEditing(record);
           form.setFieldsValue({
             ...record,
             dueDate: dayjs(record.dueDate),
             internshipTermId: selectedTerm,
           });
           setOpen(true);
         }}
       >
         Sửa
       </Button>
     ),
   },
 ];
  return (
    <>
      <Divider>
        <Title level={3}>
          Quản lý Deadline{" "}
          {selectedTermName && <Tag color="green">{selectedTermName}</Tag>}
        </Title>
        <Text type="secondary">Tổng deadline: {data.length}</Text>
      </Divider>

      {/* SELECT TERM */}
      <Row justify="space-between" className="mb-3">
        <Col>
          <Select
            value={selectedTerm}
            style={{ width: 250 }}
            onChange={(value) => setSelectedTerm(value)}
          >
            {terms.map((term) => (
              <Option key={term.id} value={term.id}>
                {term.name}
              </Option>
            ))}
          </Select>
        </Col>

        <Col>
          <Button
            type="primary"
            onClick={() => {
              setEditing(null);
              form.resetFields();
              setOpen(true);
            }}
          >
            Thêm Deadline
          </Button>
        </Col>
      </Row>

      {/* TABLE */}
      <Table
        rowKey="id"
        dataSource={data}
        columns={columns}
        loading={loading}
        bordered
        pagination={{ pageSize: 6 }}
      />

      {/* MODAL */}
      <Modal
        open={open}
        title="Tạo Deadline"
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="weekNo"
            label="Tuần"
            rules={[{ required: true, message: "Nhập tuần!" }]}
          >
            <Input type="number" min={1} />
          </Form.Item>

          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Nhập tiêu đề!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="Hạn nộp"
            rules={[{ required: true, message: "Chọn hạn nộp!" }]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="internshipTermId"
            label="Kỳ thực tập"
            initialValue={selectedTerm}
            rules={[{ required: true, message: "Chọn kỳ!" }]}
          >
            <Select>
              {terms.map((term) => (
                <Option key={term.id} value={term.id}>
                  {term.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
