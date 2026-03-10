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
  Radio,
} from "antd";
import { useState, useEffect } from "react";
import { DeadlineAPI } from "../../api/DeadlineAPI";
import { TermAPI } from "../../api/TermAPI";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

export default function DeadlineManage() {
  const [data, setData] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form] = Form.useForm();
  const navigate = useNavigate();

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
        weekNo: values.type === "REPORT" ? values.weekNo : null,
        title: values.title,
        description: values.description,
        type: values.type,
        dueDate:
          values.type === "REPORT"
            ? values.dueDate.format("YYYY-MM-DDTHH:mm:ss")
            : null,
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

  /* ================= TABLE COLUMNS ================= */

  const columns = [
    {
      title: "Tuần",
      dataIndex: "weekNo",
      render: (week, record) =>
        record.type === "ANNOUNCEMENT" ? "-" : `Tuần ${week}`,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      width: 380,
      render: (text) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;

        if (!text) return "-";

        return text.split(urlRegex).map((part, index) =>
          urlRegex.test(part) ? (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#1677ff", textDecoration: "none" }}
              onMouseEnter={(e) =>
                (e.target.style.textDecoration = "underline")
              }
              onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
            >
              {part}
            </a>
          ) : (
            part
          )
        );
      },
    },
    {
      title: "Loại",
      dataIndex: "type",
      filters: [
        { text: "🟢 Thông báo", value: "ANNOUNCEMENT" },
        { text: "🔴 Deadline", value: "REPORT" },
      ],
      onFilter: (value, record) => record.type === value,
      render: (type) =>
        type === "ANNOUNCEMENT" ? (
          <Tag color="green">Thông báo</Tag>
        ) : (
          <Tag color="red">Deadline</Tag>
        ),
    },
    {
      title: "Hạn nộp",
      dataIndex: "dueDate",
      render: (date, record) =>
        record.type === "ANNOUNCEMENT"
          ? "-"
          : dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button
            onClick={() => {
              setEditing(record);

              form.setFieldsValue({
                ...record,
                type: record.type || "REPORT",
                dueDate: record.dueDate ? dayjs(record.dueDate) : null,
                internshipTermId: selectedTerm,
              });

              setOpen(true);
            }}
          >
            Sửa
          </Button>

          {record.type === "REPORT" && (
            <Button
              type="primary"
              onClick={() => navigate(`/teacher/deadline/${record.id}/reports`)}
            >
              Xem
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Divider>
        <Title level={3}>Quản lý Deadline</Title>
        <Text type="secondary">Tổng deadline: {data.length}</Text>
      </Divider>

      {/* TERM SELECT */}

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

              form.setFieldsValue({
                type: "REPORT",
                internshipTermId: selectedTerm,
              });

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

      {/* CREATE / EDIT MODAL */}

      <Modal
        open={open}
        title={editing ? "Chỉnh sửa Deadline" : "Tạo Deadline"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="internshipTermId"
            label="Kỳ thực tập"
            rules={[{ required: true }]}
          >
            <Select>
              {terms.map((term) => (
                <Option key={term.id} value={term.id}>
                  {term.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại"
            initialValue="REPORT"
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Radio value="REPORT">Deadline báo cáo</Radio>
              <Radio value="ANNOUNCEMENT">Thông báo</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item shouldUpdate={(prev, cur) => prev.type !== cur.type}>
            {({ getFieldValue }) =>
              getFieldValue("type") === "REPORT" ? (
                <Form.Item
                  name="weekNo"
                  label="Tuần"
                  rules={[{ required: true, message: "Nhập tuần" }]}
                >
                  <Input type="number" min={1} />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item shouldUpdate={(prev, cur) => prev.type !== cur.type}>
            {({ getFieldValue }) =>
              getFieldValue("type") === "REPORT" ? (
                <Form.Item
                  name="dueDate"
                  label="Hạn nộp"
                  rules={[{ required: true }]}
                >
                  <DatePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
