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
  const [searchKeyword, setSearchKeyword] = useState("");

  const [form] = Form.useForm();
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("userData"));
  const userId = userData?.userId;

  const currentTerm = terms.find((term) => term.id === selectedTerm);

  const now = dayjs();

  const isTermNotStarted =
    currentTerm?.startDate &&
    now.isBefore(dayjs(currentTerm.startDate), "day");

  const isTermEnded =
    currentTerm?.endDate &&
    now.isAfter(dayjs(currentTerm.endDate), "day");

  const isDeadlineDisabled = isTermNotStarted || isTermEnded;

  /* ================= CHECK KỲ ĐANG DIỄN RA ================= */

  const getCurrentTerm = (termList) => {
    const today = dayjs();

    return termList.find((term) => {
      if (term.status === "DANG_DIEN_RA") return true;

      if (term.status === "Đang diễn ra") return true;

      if (!term.startDate || !term.endDate) return false;

      const startDate = dayjs(term.startDate);
      const endDate = dayjs(term.endDate);

      return (
        !today.isBefore(startDate, "day") &&
        !today.isAfter(endDate, "day")
      );
    });
  };

  /* ================= TỰ TĂNG TUẦN ================= */

  const getNextWeekNo = () => {
    const weekNumbers = data
      .filter((item) => item.type === "REPORT")
      .map((item) => Number(item.weekNo))
      .filter((week) => !Number.isNaN(week));

    if (weekNumbers.length === 0) return 1;

    return Math.max(...weekNumbers) + 1;
  };

  /* ================= VALIDATE HẠN NỘP ================= */

  const disabledDueDate = (current) => {
    // Không cho chọn hôm nay và các ngày trong quá khứ
    return current && !current.isAfter(dayjs(), "day");
  };

  const validateDueDate = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Vui lòng chọn hạn nộp"));
    }

    if (!value.isAfter(dayjs(), "day")) {
      return Promise.reject(new Error("Hạn nộp phải sau ngày hiện tại"));
    }

    return Promise.resolve();
  };

  /* ================= LOAD TERM ================= */

  useEffect(() => {
    const loadTerms = async () => {
      try {
        const res = await TermAPI.getAllTermForTeacherLayout();

        const termList = res.data || [];
        setTerms(termList);

        if (termList.length > 0) {
          const currentTerm = getCurrentTerm(termList);
          setSelectedTerm(currentTerm?.id || termList[0].id);
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

  /* ================= SEARCH ================= */

  const filteredData = data.filter((item) => {
    const keyword = searchKeyword.trim().toLowerCase();

    if (!keyword) return true;

    const typeText =
      item.type === "ANNOUNCEMENT"
        ? "thông báo announcement"
        : "deadline báo cáo report";

    const weekText =
      item.type === "REPORT" && item.weekNo
        ? `tuần ${item.weekNo} week ${item.weekNo} w${item.weekNo}`
        : "";

    const dueDateText = item.dueDate
      ? dayjs(item.dueDate).format("DD/MM/YYYY HH:mm")
      : "";

    const searchableText = [
      item.title,
      item.description,
      typeText,
      weekText,
      dueDateText,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(keyword);
  });

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
    } catch (error) {
      if (error?.errorFields) return;

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
        const onlyUrlRegex = /^https?:\/\/[^\s]+$/;

        if (!text) return "-";

        return text.split(urlRegex).map((part, index) =>
          onlyUrlRegex.test(part) ? (
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
          : date
          ? dayjs(date).format("DD/MM/YYYY HH:mm")
          : "-",
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          <Button
            disabled={isDeadlineDisabled}
            onClick={() => {
              if (isDeadlineDisabled) {
                message.warning("Học kỳ chưa bắt đầu hoặc đã kết thúc!");
                return;
              }

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
              onClick={() =>
                navigate(`/teacher/deadline/${record.id}/reports`)
              }
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
        <Text type="secondary">
          Tổng deadline: {filteredData.length}/{data.length}
        </Text>
      </Divider>

      {/* TERM + SEARCH + BUTTON */}

      <Row justify="space-between" className="mb-3" gutter={[12, 12]}>
        <Col>
          <Space wrap>
            <Select
              value={selectedTerm}
              style={{ width: 250 }}
              onChange={(value) => {
                setSelectedTerm(value);
                setSearchKeyword("");
              }}
              placeholder="Chọn kỳ thực tập"
            >
              {terms.map((term) => (
                <Option key={term.id} value={term.id}>
                  {term.name} ({term.academicYear})
                </Option>
              ))}
            </Select>

            <Input.Search
              value={searchKeyword}
              placeholder="Tìm tiêu đề, mô tả, tuần..."
              allowClear
              style={{ width: 320 }}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={(value) => setSearchKeyword(value)}
            />
          </Space>
        </Col>

        <Col>
          <Button
            type="primary"
            disabled={isDeadlineDisabled}
            onClick={() => {
              if (isDeadlineDisabled) {
                message.warning("Học kỳ chưa bắt đầu hoặc đã kết thúc!");
                return;
              }

              setEditing(null);
              form.resetFields();

              form.setFieldsValue({
                type: "REPORT",
                internshipTermId: selectedTerm,
                weekNo: getNextWeekNo(),
              });

              setOpen(true);
            }}
          >
            Thêm Deadline
          </Button>
        </Col>
      </Row>

      {/* THÔNG BÁO TRẠNG THÁI KỲ */}

      {currentTerm && isTermNotStarted && (
        <Tag color="orange" style={{ marginBottom: 12 }}>
          Học kỳ chưa bắt đầu, không thể thêm hoặc sửa deadline
        </Tag>
      )}

      {currentTerm && isTermEnded && (
        <Tag color="red" style={{ marginBottom: 12 }}>
          Học kỳ đã kết thúc, không thể thêm hoặc sửa deadline
        </Tag>
      )}

      {/* TABLE */}

      <Table
        rowKey="id"
        dataSource={filteredData}
        columns={columns}
        loading={loading}
        bordered
        pagination={{ pageSize: 6 }}
      />

      {/* CREATE / EDIT MODAL */}

      <Modal
        open={open}
        title={editing ? "Chỉnh sửa Deadline" : "Tạo Deadline"}
        onCancel={() => {
          setOpen(false);
          setEditing(null);
          form.resetFields();
        }}
        onOk={onSubmit}
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="internshipTermId"
            label="Kỳ thực tập"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn kỳ thực tập",
              },
            ]}
          >
            <Select>
              {terms.map((term) => (
                <Option key={term.id} value={term.id}>
                  {term.name} ({term.academicYear})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại"
            initialValue="REPORT"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn loại",
              },
            ]}
          >
            <Radio.Group
              onChange={(e) => {
                const type = e.target.value;

                if (type === "REPORT") {
                  const currentWeek = form.getFieldValue("weekNo");

                  form.setFieldsValue({
                    weekNo: currentWeek || getNextWeekNo(),
                  });
                }

                if (type === "ANNOUNCEMENT") {
                  form.setFieldsValue({
                    weekNo: null,
                    dueDate: null,
                  });
                }
              }}
            >
              <Radio value="REPORT">Deadline báo cáo</Radio>
              <Radio value="ANNOUNCEMENT">Thông báo</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, cur) => prev.type !== cur.type}
          >
            {({ getFieldValue }) =>
              getFieldValue("type") === "REPORT" ? (
                <Form.Item
                  name="weekNo"
                  label="Tuần"
                  rules={[
                    {
                      required: true,
                      message: "Nhập tuần",
                    },
                  ]}
                >
                  <Input type="number" min={1} />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tiêu đề",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, cur) => prev.type !== cur.type}
          >
            {({ getFieldValue }) =>
              getFieldValue("type") === "REPORT" ? (
                <Form.Item
                  name="dueDate"
                  label="Hạn nộp"
                  rules={[
                    {
                      validator: validateDueDate,
                    },
                  ]}
                >
                  <DatePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    style={{ width: "100%" }}
                    disabledDate={disabledDueDate}
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