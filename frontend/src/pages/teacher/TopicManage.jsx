import {
  Table,
  Input,
  Divider,
  Space,
  Select,
  message,
  Button,
  Tag,
} from "antd";
import { useState, useEffect } from "react";
import { FaBook } from "react-icons/fa";
import { TermAPI } from "../../api/TermAPI";
import { TopicAPI } from "../../api/TopicAPI";
import { toast } from "react-toastify";

const { Option } = Select;

export default function TopicManage() {
  const [data, setData] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [teacherId, setTeacherId] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  /* ================= LẤY USER ================= */
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsed = JSON.parse(userData);
      setTeacherId(parsed.userId);
    }
  }, []);

  /* ================= LOAD TERM ================= */
  useEffect(() => {
    loadInternShipTerm();
  }, []);

  const loadInternShipTerm = async () => {
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

  /* ================= LOAD TOPIC ================= */
  const loadTopics = async (teacherId, termId) => {
    try {
      const res = await TopicAPI.findTopicsByTeacherAndTerm(teacherId, termId);
      setData(res.data || []);
    } catch {
      message.error("Tải danh sách đề tài thất bại!");
      setData([]);
    }
  };

  useEffect(() => {
    if (teacherId && selectedTerm) {
      loadTopics(teacherId, selectedTerm);
    }
  }, [teacherId, selectedTerm]);

  const handleTermChange = async (value) => {
    setSelectedTerm(value);
    if (!value || !teacherId) {
      setData([]);
      return;
    }
    await loadTopics(teacherId, value);
  };

  /* ================= APPROVE / REJECT ================= */
  const handleApprove = async (record) => {
    try {
      await TopicAPI.approveTopic(record.id);
      toast.success("Đã chấp nhận đề tài!");
      loadTopics(teacherId, selectedTerm);
    } catch {
      toast.error("Lỗi khi chấp nhận!");
    }
  };

  const handleReject = async (record) => {
    try {
      await TopicAPI.rejectTopic(record.id);
      toast.success("Đã từ chối đề tài!");
      loadTopics(teacherId, selectedTerm);
    } catch {
      toast.error("Từ chối thất bại!");
    }
  };

  /* ================= FILTER + SEARCH ================= */
  const filteredData = data.filter((item) => {
    const matchStatus = statusFilter ? item.status === statusFilter : true;

    const lowerKeyword = searchKeyword.toLowerCase();

    const matchSearch = searchKeyword
      ? item.studentCode?.toLowerCase().includes(lowerKeyword) ||
        item.fullName?.toLowerCase().includes(lowerKeyword) ||
        item.title?.toLowerCase().includes(lowerKeyword)
      : true;

    return matchStatus && matchSearch;
  });

  /* ================= STATUS TAG ================= */
  const renderStatusTag = (status) => {
    const statusMap = {
      PENDING: { text: "Chờ duyệt", color: "gold" },
      APPROVED_BY_TEACHER: { text: "GV đã duyệt", color: "blue" },
      REJECTED_BY_TEACHER: { text: "GV đã từ chối", color: "red" },
      APPROVED_BY_ADMIN: { text: "Admin đã duyệt", color: "green" },
      CANCELLED_BY_STUDENT: { text: "SV đã hủy", color: "default" },
    };

    const current = statusMap[status] || {
      text: status,
      color: "default",
    };

    return <Tag color={current.color}>{current.text}</Tag>;
  };

  /* ================= COLUMNS ================= */
  const columns = [
    { title: "Mã SV", dataIndex: "studentCode" },
    { title: "Tên sinh viên", dataIndex: "fullName" },
    { title: "Tên đề tài", dataIndex: "title" },
    { title: "Mô tả", dataIndex: "description" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => renderStatusTag(status),
    },
    {
      title: "Hành động",
      render: (_, record) => {
        const isLocked = record.status === "APPROVED_BY_ADMIN";

        return (
          <Space>
            <Button
              type="primary"
              disabled={isLocked}
              onClick={() => handleApprove(record)}
            >
              Chấp nhận
            </Button>

            <Button
              danger
              disabled={isLocked}
              onClick={() => handleReject(record)}
            >
              Từ chối
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Divider>
        <h2 className="fw-bold">
          <FaBook /> Danh sách đề tài sinh viên
        </h2>
      </Divider>

      <Space style={{ marginBottom: 16 }}>
        <Select
          value={selectedTerm}
          style={{ width: 250 }}
          onChange={handleTermChange}
        >
          {terms.map((term) => (
            <Option key={term.id} value={term.id}>
              {term.name}
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Lọc trạng thái"
          style={{ width: 200 }}
          allowClear
          onChange={(value) => setStatusFilter(value)}
        >
          <Option value="PENDING">Chờ duyệt</Option>
          <Option value="APPROVED_BY_TEACHER">GV đã duyệt</Option>
          <Option value="REJECTED_BY_TEACHER">GV đã từ chối</Option>
          <Option value="APPROVED_BY_ADMIN">Admin đã duyệt</Option>
          <Option value="CANCELLED_BY_STUDENT">SV đã hủy</Option>
        </Select>

        <Input.Search
          placeholder="Tìm sinh viên hoặc đề tài..."
          allowClear
          onSearch={(value) => setSearchKeyword(value)}
          style={{ width: 300 }}
        />
      </Space>

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </>
  );
}
