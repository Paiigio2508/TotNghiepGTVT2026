import {
  Table,
  Input,
  Divider,
  Space,
  Select,
  Button,
  message,
  Tag,
} from "antd";
import { useState, useEffect } from "react";
import { FaBook } from "react-icons/fa";
import { TopicAPI } from "../../api/TopicAPI";
import { TermAPI } from "../../api/TermAPI";
import { toast } from "react-toastify";

const { Option } = Select;

export default function TopicManage() {
  const [data, setData] = useState([]);
  const [dataGoc, setDataGoc] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  /* ================= LOAD TERM ================= */
  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      const res = await TermAPI.getAll();
      setTerms(res.data);
      if (res.data.length > 0) {
        setSelectedTerm(res.data[0].id);
      }
    } catch {
      message.error("Tải kỳ thực tập thất bại!");
    }
  };

  /* ================= LOAD TOPIC ================= */
  useEffect(() => {
    if (selectedTerm) {
      loadTopics(selectedTerm);
    }
  }, [selectedTerm]);

  const loadTopics = async (termId) => {
    try {
      const res = await TopicAPI.findTopicsByAdmin(termId);
      setData(res.data);
      setDataGoc(res.data);
    } catch {
      message.error("Tải danh sách đề tài thất bại!");
    }
  };

  /* ================= APPROVE ================= */
  const handleApprove = async (record) => {
    try {
      await TopicAPI.adminApproveTopic(record.id);
      toast.success("Duyệt thành công!");
      loadTopics(selectedTerm);
    } catch {
      toast.error("Duyệt thất bại!");
    }
  };

  /* ================= FILTER ================= */
  const handleFilterTeacher = (teacherName) => {
    setSelectedTeacher(teacherName);

    if (!teacherName) {
      setData(dataGoc);
      return;
    }

    const filtered = dataGoc.filter((item) => item.teacherName === teacherName);

    setData(filtered);
  };

  /* ================= SEARCH ================= */
  const handleSearch = (keyword) => {
    if (!keyword) {
      setData(dataGoc);
      return;
    }

    const filtered = dataGoc.filter(
      (item) =>
        item.studentCode?.toLowerCase().includes(keyword.toLowerCase()) ||
        item.fullName?.toLowerCase().includes(keyword.toLowerCase()) ||
        item.title?.toLowerCase().includes(keyword.toLowerCase())
    );

    setData(filtered);
  };

  /* ================= UNIQUE TEACHER LIST ================= */
  const teacherOptions = [...new Set(dataGoc.map((item) => item.teacherName))];

  /* ================= COLUMNS ================= */
  const columns = [
    { title: "Mã SV", dataIndex: "studentCode" },
    { title: "Tên SV", dataIndex: "fullName" },
    { title: "Lớp", dataIndex: "className" },
    { title: "Đề tài", dataIndex: "title" },
    { title: "Giảng viên", dataIndex: "teacherName" },
    { title: "Mã GV", dataIndex: "teacherCode" },
    { title: "Khóa", dataIndex: "academicYear" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) =>
        status === "APPROVED_BY_TEACHER" ? (
          <Tag color="blue">Chờ Admin duyệt</Tag>
        ) : (
          <Tag color="green">Đã duyệt</Tag>
        ),
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Button
          type="primary"
          disabled={record.status === "APPROVED_BY_ADMIN"}
          onClick={() => handleApprove(record)}
        >
          Duyệt
        </Button>
      ),
    },
  ];

  return (
    <>
      <Divider>
        <h2 className="fw-bold">
          <FaBook /> Danh sách đề tài chờ Admin duyệt
        </h2>
      </Divider>

      <Space style={{ marginBottom: 16 }}>
        {/* TERM FILTER */}
        <Select
          value={selectedTerm}
          style={{ width: 200 }}
          onChange={(value) => setSelectedTerm(value)}
        >
          {terms.map((term) => (
            <Option key={term.id} value={term.id}>
              {term.name}
            </Option>
          ))}
        </Select>

        {/* TEACHER FILTER */}
        <Select
          allowClear
          placeholder="Lọc theo giảng viên"
          style={{ width: 220 }}
          onChange={handleFilterTeacher}
        >
          {teacherOptions.map((teacher) => (
            <Option key={teacher} value={teacher}>
              {teacher}
            </Option>
          ))}
        </Select>

        {/* SEARCH */}
        <Input.Search
          placeholder="Tìm mã SV / tên SV / đề tài..."
          allowClear
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
      </Space>

      <Table dataSource={data} columns={columns} rowKey="id" />
    </>
  );
}
