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
  Tag,
  message,
} from "antd";
import { useState, useEffect } from "react";
import { FaBook } from "react-icons/fa";
import { TopicAPI } from "../../api/TopicAPI";
import { toast } from "react-toastify";
const { TextArea } = Input;

export default function TopicRegister() {
  const [data, setData] = useState([]);
  const [dataGoc, setDataGoc] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const studentLocal = JSON.parse(localStorage.getItem("userData"));
  const studentId = studentLocal?.userId;

  /* ================= LOAD DATA ================= */
  const loadTopics = async () => {
    try {
      const res = await TopicAPI.getByStudent(studentId);

      // 🔥 đảm bảo luôn là array
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.data || res.data?.content || [];

      setData(list);
      setDataGoc(list);
    } catch (err) {
      message.error("Không tải được danh sách đề tài!");
    }
  };

  useEffect(() => {
    if (studentId) {
      loadTopics();
    }
  }, [studentId]);

  /* ================= CHECK APPROVED ================= */
  const hasApproved =
    Array.isArray(data) &&
    data.some(
      (item) =>
        item.status === "APPROVED_BY_TEACHER" ||
        item.status === "APPROVED_BY_ADMIN",
    );

  /* ================= SEARCH ================= */
  const handleSearch = (keyword) => {
    if (!keyword || keyword.trim() === "") {
      setData(dataGoc);
      return;
    }

    const result = dataGoc.filter(
      (item) =>
        item.title?.toLowerCase().includes(keyword.toLowerCase()) ||
        item.description?.toLowerCase().includes(keyword.toLowerCase()),
    );

    setData(result);
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editing) {
        const res = await TopicAPI.update(editing.id, studentId, values);
        const data = res?.data || res;

        if (data?.success === false) {
          toast.error(data?.message || "Cập nhật thất bại!");
          return;
        }

        toast.success(data?.message || "Cập nhật đề tài thành công!");
      } else {
        if (hasApproved) {
          toast.error("Bạn đã có đề tài được duyệt. Không thể đăng ký thêm!");
          return;
        }

        const res = await TopicAPI.create(studentId, values);
        const data = res?.data || res;

        if (data?.success === false) {
          toast.error(data?.message || "Đăng ký thất bại!");
          return;
        }

        toast.success(data?.message || "Đăng ký đề tài thành công!");
      }

      setOpen(false);
      form.resetFields();
      setEditing(null);
      loadTopics();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Có lỗi xảy ra!",
      );
    }
  };

  /* ================= HỦY ================= */
  const onCancelTopic = async (id) => {
    try {
      await TopicAPI.cancel(id, studentId);
      toast.success("Hủy đề tài thành công!");
      loadTopics();
    } catch (err) {
      message.error(err.response?.data?.message || "Không thể hủy đề tài!");
    }
  };

  /* ================= EDIT ================= */
  const onEdit = (record) => {
    if (record.status !== "PENDING") {
      toast.warning("Chỉ được chỉnh sửa khi đang chờ duyệt!");
      return;
    }

    setEditing(record);
    form.setFieldsValue({
      title: record.title,
      description: record.description,
    });
    setOpen(true);
  };

  /* ================= COLUMNS ================= */
  const columns = [
    { title: "Tên đề tài", dataIndex: "title" },
    { title: "Mô tả", dataIndex: "description" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => {
        const statusMap = {
          PENDING: { text: "Chờ duyệt", color: "orange" },
          APPROVED_BY_TEACHER: { text: "GV đã duyệt", color: "blue" },
          APPROVED_BY_ADMIN: { text: "Đã duyệt chính thức", color: "green" },
          REJECTED_BY_TEACHER: { text: "GV từ chối", color: "red" },
          REJECTED_BY_ADMIN: { text: "Đào tạo từ chối", color: "red" },
          CANCELLED_BY_STUDENT: { text: "Đã hủy", color: "default" },
        };

        const current = statusMap[status];
        return <Tag color={current?.color}>{current?.text}</Tag>;
      },
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button onClick={() => onEdit(record)}>Chỉnh sửa</Button>
          {record.status === "PENDING" && (
            <Popconfirm
              title="Bạn có chắc muốn hủy đề tài này?"
              onConfirm={() => onCancelTopic(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button danger>Hủy</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Divider>
        <h2 className="fw-bold">
          <FaBook /> Đăng ký đề tài
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
              <Button type="primary" onClick={() => setData(dataGoc)}>
                Làm mới
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>

      {/* ADD BUTTON */}
      <Space className="mb-4 mt-3 float-end">
        <Button
          type="primary"
          disabled={hasApproved}
          onClick={() => {
            setEditing(null);
            form.resetFields();
            setOpen(true);
          }}
        >
          Đăng ký đề tài
        </Button>
      </Space>

      {/* TABLE */}
      <Table
        dataSource={Array.isArray(data) ? data : []}
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
        title={editing ? "Chỉnh sửa đề tài" : "Đăng ký đề tài"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        okText="Lưu"
        cancelText="Hủy"
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
                <Input placeholder={`VD: Xây dựng (Website, hệ thống)....  `} />
              </Form.Item>

              <Form.Item
                name="description"
                label="Mô tả"
                initialValue={`Nội dung và phạm vi đề tài:
- Nêu chức năng chính:
- Công nghệ, công cụ, ngôn ngữ lập trình:
- Đặc điểm nổi bật hệ thống của mình:
`}
                rules={[{ required: true, message: "Không được để trống!" }]}
              >
                <TextArea rows={10} />
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Modal>
    </>
  );
}
