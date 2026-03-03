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
  const [viewOpen, setViewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [selectedDeadline, setSelectedDeadline] = useState(null);
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

  /* ================= LOAD REPORTS ================= */
const loadReports = async (deadline) => {
  try {
    setLoadingReport(true);

    const res = await DeadlineAPI.getTeacherReports(
      deadline.id,
      userId
    );

    console.log("Report API response:", res.data);

    // 🔥 đảm bảo luôn là array
    const safeData = Array.isArray(res.data) ? res.data : res.data?.data || [];

    setReportData(safeData);
    setSelectedDeadline(deadline);
    setViewOpen(true);
  } catch (error) {
    console.log(error);
    message.error("Tải danh sách sinh viên thất bại!");
    setReportData([]);
  } finally {
    setLoadingReport(false);
  }
};
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
        <Space>
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

          <Button type="primary" onClick={() => loadReports(record)}>
            Xem
          </Button>
        </Space>
      ),
    },
  ];
const handleDownloadAll = async () => {
  try {
    const res = await DeadlineAPI.downloadAllReports(selectedDeadline.id,userId);

    // 🔥 tạo blob đúng cách
    const blob = new Blob([res.data], {
      type: "application/zip",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `Week_${selectedDeadline.weekNo}_Reports.zip`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.log(error);
    message.error("Download thất bại!");
  }
};
  return (
    <>
      <Divider>
        <Title level={3}>Quản lý Deadline</Title>
        <Text type="secondary">Tổng deadline: {data.length}</Text>
      </Divider>

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
        title="Tạo Deadline"
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item name="weekNo" label="Tuần" rules={[{ required: true }]}>
            <Input type="number" min={1} />
          </Form.Item>

          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>

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

          <Form.Item
            name="internshipTermId"
            label="Kỳ thực tập"
            initialValue={selectedTerm}
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
        </Form>
      </Modal>

      {/* VIEW REPORT MODAL */}
      <Modal
        open={viewOpen}
        title={`Danh sách sinh viên - Tuần ${selectedDeadline?.weekNo}`}
        onCancel={() => setViewOpen(false)}
        footer={null}
        width={800}
      >
        <Button 
        className="float-end"
          type="primary"
          style={{ marginBottom: 16 }}
          onClick={handleDownloadAll}
        >
          Download tất cả
        </Button>

        <Table
          rowKey="studentId"
          loading={loadingReport}
          dataSource={reportData}
          pagination={false}
          columns={[
            {
              title: "Sinh viên",
              dataIndex: "studentName",
            },
            {
              title: "Trạng thái",
              render: (_, record) => {
                if (record.status === "SUBMITTED")
                  return <Tag color="green">Đã nộp</Tag>;
                if (record.status === "LATE")
                  return <Tag color="orange">Nộp trễ</Tag>;
                return <Tag color="blue">Chưa nộp</Tag>;
              },
            },
          ]}
        />
      </Modal>
    </>
  );
}
