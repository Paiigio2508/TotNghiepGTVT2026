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
import { useState, useEffect, useMemo } from "react";
import { FaBook } from "react-icons/fa";
import { TopicAPI } from "../../api/TopicAPI";
import { TermAPI } from "../../api/TermAPI";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const { Option } = Select;

export default function TopicManage() {
  const [data, setData] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= CHECK KỲ ĐANG DIỄN RA ================= */

  const getCurrentTerm = (termList) => {
    const today = dayjs();

    return termList.find((term) => {
      // Ưu tiên status từ backend
      if (term.status === "DANG_DIEN_RA") return true;

      // Nếu backend trả tiếng Việt
      if (term.status === "Đang diễn ra") return true;

      // Nếu status chưa chuẩn thì check theo ngày
      if (!term.startDate || !term.endDate) return false;

      const startDate = dayjs(term.startDate);
      const endDate = dayjs(term.endDate);

      return (
        !today.isBefore(startDate, "day") &&
        !today.isAfter(endDate, "day")
      );
    });
  };

  /* ================= LOAD TERM ================= */

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      const res = await TermAPI.getAll();

      const termList = res.data || [];
      setTerms(termList);

      if (termList.length > 0) {
        const currentTerm = getCurrentTerm(termList);

        // Ưu tiên kỳ đang diễn ra, nếu không có thì lấy kỳ đầu tiên
        setSelectedTerm(currentTerm?.id || termList[0].id);
      }
    } catch {
      message.error("Tải kỳ thực tập thất bại!");
    }
  };

  /* ================= LOAD TOPIC ================= */

  useEffect(() => {
    if (selectedTerm) {
      loadTopics(selectedTerm);
    } else {
      setData([]);
    }
  }, [selectedTerm]);

  const loadTopics = async (termId) => {
    try {
      setLoading(true);

      const res = await TopicAPI.findTopicsByAdmin(termId);

      setData(Array.isArray(res.data) ? res.data : []);
    } catch {
      message.error("Tải danh sách đề tài thất bại!");
      setData([]);
    } finally {
      setLoading(false);
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

  /* ================= UNIQUE TEACHER LIST ================= */

  const teacherOptions = useMemo(() => {
    return [
      ...new Set(
        data
          .map((item) => item.teacherName)
          .filter((teacherName) => teacherName)
      ),
    ];
  }, [data]);

  /* ================= FILTER + SEARCH ================= */

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchTeacher = selectedTeacher
        ? item.teacherName === selectedTeacher
        : true;

      const keyword = searchKeyword.trim().toLowerCase();

      const matchSearch = keyword
        ? item.studentCode?.toLowerCase().includes(keyword) ||
          item.fullName?.toLowerCase().includes(keyword) ||
          item.title?.toLowerCase().includes(keyword)
        : true;

      return matchTeacher && matchSearch;
    });
  }, [data, selectedTeacher, searchKeyword]);

  /* ================= COLUMNS ================= */

  const columns = [
    {
      title: "Mã SV",
      dataIndex: "studentCode",
    },
    {
      title: "Tên SV",
      dataIndex: "fullName",
    },
    {
      title: "Lớp",
      dataIndex: "className",
    },
    {
      title: "Đề tài",
      dataIndex: "title",
      render: (text) => (
        <div
          style={{
            whiteSpace: "normal",
            wordBreak: "break-word",
            lineHeight: "1.4",
          }}
        >
          {text || "-"}
        </div>
      ),
    },
    {
      title: "Giảng viên",
      dataIndex: "teacherName",
    },
    {
      title: "Mã GV",
      dataIndex: "teacherCode",
    },
    {
      title: "Khóa",
      dataIndex: "academicYear",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) =>
        status === "APPROVED_BY_TEACHER" ? (
          <Tag color="blue">Chờ Admin duyệt</Tag>
        ) : status === "APPROVED_BY_ADMIN" ? (
          <Tag color="green">Đã duyệt</Tag>
        ) : (
          <Tag color="default">{status}</Tag>
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
          style={{ width: 220 }}
          placeholder="Chọn kỳ thực tập"
          onChange={(value) => {
            setSelectedTerm(value);
            setSelectedTeacher(null);
            setSearchKeyword("");
          }}
        >
          {terms.map((term) => (
            <Option key={term.id} value={term.id}>
              {term.name} ({term.academicYear})
            </Option>
          ))}
        </Select>

        {/* TEACHER FILTER */}
        <Select
          value={selectedTeacher}
          allowClear
          placeholder="Lọc theo giảng viên"
          style={{ width: 220 }}
          onChange={(value) => setSelectedTeacher(value || null)}
        >
          {teacherOptions.map((teacher) => (
            <Option key={teacher} value={teacher}>
              {teacher}
            </Option>
          ))}
        </Select>

        {/* SEARCH */}
        <Input.Search
          value={searchKeyword}
          placeholder="Tìm mã SV / tên SV / đề tài..."
          allowClear
          onChange={(e) => setSearchKeyword(e.target.value)}
          onSearch={(value) => setSearchKeyword(value)}
          style={{ width: 300 }}
        />
      </Space>

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        loading={loading}
        bordered
        pagination={{ pageSize: 6 }}
      />
    </>
  );
}