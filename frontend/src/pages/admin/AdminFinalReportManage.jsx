import {
  Table,
  Input,
  Divider,
  Space,
  Select,
  Button,
  message,
  Tag,
  Modal,
  InputNumber,
  Popconfirm,
  Tooltip,
} from "antd";
import { useState, useEffect, useMemo } from "react";
import { FaFileAlt } from "react-icons/fa";
import { EyeOutlined, CheckOutlined, EditOutlined } from "@ant-design/icons";
import { TermAPI } from "../../api/TermAPI";
import { FinalReportAPI } from "../../api/FinalReportAPI";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const { Option } = Select;

export default function AdminFinalReportManage() {
  const [data, setData] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const [openGradeModal, setOpenGradeModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [score, setScore] = useState(null);
  const [grading, setGrading] = useState(false);

  const getCurrentTerm = (termList) => {
    const today = dayjs();

    return termList.find((term) => {
      if (term.status === "DANG_DIEN_RA") return true;
      if (term.status === "Đang diễn ra") return true;

      if (!term.startDate || !term.endDate) return false;

      const startDate = dayjs(term.startDate);
      const endDate = dayjs(term.endDate);

      return !today.isBefore(startDate, "day") && !today.isAfter(endDate, "day");
    });
  };

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
        setSelectedTerm(currentTerm?.id || termList[0].id);
      }
    } catch (error) {
      console.log(error);
      message.error("Tải kỳ thực tập thất bại!");
    }
  };

  useEffect(() => {
    if (selectedTerm) {
      loadFinalReports(selectedTerm);
    } else {
      setData([]);
    }
  }, [selectedTerm]);

  const loadFinalReports = async (termId) => {
    try {
      setLoading(true);

      const res = await FinalReportAPI.getByTerm(termId);

      setData(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log(error);
      message.error("Tải danh sách báo cáo cuối kỳ thất bại!");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminApprove = async (record) => {
    try {
      await FinalReportAPI.adminApprove(record.id);

      toast.success("Admin duyệt báo cáo thành công!");
      loadFinalReports(selectedTerm);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Duyệt báo cáo thất bại!");
    }
  };

  const openGrade = (record) => {
    setSelectedRecord(record);
    setScore(record.score ?? null);
    setOpenGradeModal(true);
  };

  const handleGrade = async () => {
    if (score === null || score === undefined) {
      toast.warning("Vui lòng nhập điểm!");
      return;
    }

    if (score < 0 || score > 10) {
      toast.warning("Điểm phải nằm trong khoảng từ 0 đến 10!");
      return;
    }

    try {
      setGrading(true);

      await FinalReportAPI.grade(selectedRecord.id, {
        score,
      });

      toast.success("Chấm điểm thành công!");

      setOpenGradeModal(false);
      setSelectedRecord(null);
      setScore(null);

      loadFinalReports(selectedTerm);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Chấm điểm thất bại!");
    } finally {
      setGrading(false);
    }
  };

  const handleOpenFile = (fileUrl) => {
    if (!fileUrl) {
      toast.warning("Không tìm thấy file báo cáo!");
      return;
    }

    window.open(fileUrl, "_blank");
  };

  const teacherOptions = useMemo(() => {
    return [
      ...new Set(
        data.map((item) => item.teacherName).filter((teacherName) => teacherName)
      ),
    ];
  }, [data]);

  const statusOptions = [
    { value: "SUBMITTED", label: "Đã nộp" },
    { value: "NEED_REVISION", label: "Cần sửa lại" },
    { value: "TEACHER_APPROVED", label: "Chờ Admin duyệt" },
    { value: "ADMIN_APPROVED", label: "Admin đã duyệt" },
    { value: "GRADED", label: "Đã chấm điểm" },
  ];

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchTeacher = selectedTeacher
        ? item.teacherName === selectedTeacher
        : true;

      const matchStatus = selectedStatus ? item.status === selectedStatus : true;

      const keyword = searchKeyword.trim().toLowerCase();

      const matchSearch = keyword
        ? item.studentCode?.toLowerCase().includes(keyword) ||
          item.studentName?.toLowerCase().includes(keyword) ||
          item.topicTitle?.toLowerCase().includes(keyword) ||
          item.teacherName?.toLowerCase().includes(keyword)
        : true;

      return matchTeacher && matchStatus && matchSearch;
    });
  }, [data, selectedTeacher, selectedStatus, searchKeyword]);

  const renderStatus = (status) => {
    switch (status) {
      case "SUBMITTED":
        return <Tag color="blue">Đã nộp</Tag>;
      case "NEED_REVISION":
        return <Tag color="orange">Cần sửa lại</Tag>;
      case "TEACHER_APPROVED":
        return <Tag color="purple">Chờ Admin duyệt</Tag>;
      case "ADMIN_APPROVED":
        return <Tag color="green">Admin đã duyệt</Tag>;
      case "GRADED":
        return <Tag color="cyan">Đã chấm điểm</Tag>;
      default:
        return <Tag color="default">{status || "Chưa rõ"}</Tag>;
    }
  };

  const ellipsisStyle = {
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const columns = [
    {
      title: "Mã SV",
      dataIndex: "studentCode",
      width: 100,
    },
    {
      title: "Tên SV",
      dataIndex: "studentName",
      width: 150,
      render: (text) => (
        <Tooltip title={text}>
          <div style={{ ...ellipsisStyle, maxWidth: 130 }}>
            {text || "-"}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Giảng viên",
      dataIndex: "teacherName",
      width: 150,
      render: (text) => (
        <Tooltip title={text}>
          <div style={{ ...ellipsisStyle, maxWidth: 130 }}>
            {text || "-"}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Đề tài",
      dataIndex: "topicTitle",
      width: 230,
      render: (text) => (
        <Tooltip title={text}>
          <div style={{ ...ellipsisStyle, maxWidth: 210 }}>
            {text || "-"}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "File",
      dataIndex: "originalFileName",
      width: 210,
      render: (text, record) => (
        <Tooltip title={text || "Xem file"}>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleOpenFile(record.fileUrl)}
            style={{
              padding: 0,
              maxWidth: 180,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "inline-block",
              textAlign: "left",
            }}
          >
            {text || "Xem file"}
          </Button>
        </Tooltip>
      ),
    },
    {
      title: "Ngày nộp",
      dataIndex: "submitDate",
      width: 150,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "Điểm",
      dataIndex: "score",
      width: 80,
      align: "center",
      render: (score) => (score !== null && score !== undefined ? score : "-"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 150,
      render: renderStatus,
    },
    {
      title: "Hành động",
      width: 210,
      render: (_, record) => (
        <Space wrap>
          <Tooltip title="Admin duyệt cuối">
            <Popconfirm
              title="Xác nhận duyệt báo cáo này?"
              okText="Duyệt"
              cancelText="Hủy"
              onConfirm={() => handleAdminApprove(record)}
              disabled={record.status !== "TEACHER_APPROVED"}
            >
              <Button
                type="primary"
                icon={<CheckOutlined />}
                disabled={record.status !== "TEACHER_APPROVED"}
              >
                Duyệt
              </Button>
            </Popconfirm>
          </Tooltip>

          <Tooltip title="Chấm điểm">
            <Button
              icon={<EditOutlined />}
              onClick={() => openGrade(record)}
              disabled={
                record.status !== "ADMIN_APPROVED" &&
                record.status !== "GRADED"
              }
            >
              Điểm
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filterItemStyle = {
    flex: "1 1 220px",
    minWidth: 0,
    maxWidth: 320,
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      <Divider>
        <h2
          className="fw-bold"
          style={{
            margin: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            whiteSpace: "nowrap",
            fontSize: 24,
            lineHeight: 1.2,
          }}
        >
          <FaFileAlt />
          <span>Quản lý báo cáo cuối kỳ</span>
        </h2>
      </Divider>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16,
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <div style={filterItemStyle}>
          <Select
            value={selectedTerm}
            style={{ width: "100%" }}
            placeholder="Chọn kỳ thực tập"
            onChange={(value) => {
              setSelectedTerm(value);
              setSelectedTeacher(null);
              setSelectedStatus(null);
              setSearchKeyword("");
            }}
          >
            {terms.map((term) => (
              <Option key={term.id} value={term.id}>
                {term.name} ({term.academicYear})
              </Option>
            ))}
          </Select>
        </div>

        <div style={filterItemStyle}>
          <Select
            value={selectedTeacher}
            allowClear
            placeholder="Lọc theo giảng viên"
            style={{ width: "100%" }}
            onChange={(value) => setSelectedTeacher(value || null)}
          >
            {teacherOptions.map((teacher) => (
              <Option key={teacher} value={teacher}>
                {teacher}
              </Option>
            ))}
          </Select>
        </div>

        <div style={filterItemStyle}>
          <Select
            value={selectedStatus}
            allowClear
            placeholder="Lọc theo trạng thái"
            style={{ width: "100%" }}
            onChange={(value) => setSelectedStatus(value || null)}
          >
            {statusOptions.map((status) => (
              <Option key={status.value} value={status.value}>
                {status.label}
              </Option>
            ))}
          </Select>
        </div>

        <div
          style={{
            flex: "1 1 280px",
            minWidth: 0,
            maxWidth: 420,
          }}
        >
          <Input.Search
            value={searchKeyword}
            placeholder="Tìm mã SV / tên SV / đề tài..."
            allowClear
            onChange={(e) => setSearchKeyword(e.target.value)}
            onSearch={(value) => setSearchKeyword(value)}
            style={{ width: "100%" }}
          />
        </div>
      </div>

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        loading={loading}
        bordered
        size="middle"
        tableLayout="fixed"
        pagination={{
          pageSize: 6,
          showSizeChanger: false,
        }}
        scroll={{ x: 1430 }}
        style={{
          width: "100%",
          maxWidth: "100%",
        }}
      />

      <Modal
        title="Chấm điểm báo cáo cuối kỳ"
        open={openGradeModal}
        onCancel={() => {
          setOpenGradeModal(false);
          setSelectedRecord(null);
          setScore(null);
        }}
        onOk={handleGrade}
        okText="Lưu điểm"
        cancelText="Hủy"
        confirmLoading={grading}
        width="min(520px, 92vw)"
      >
        <div style={{ marginBottom: 12 }}>
          <b>Sinh viên:</b> {selectedRecord?.studentName || "-"}
        </div>

        <div style={{ marginBottom: 12 }}>
          <b>Mã sinh viên:</b> {selectedRecord?.studentCode || "-"}
        </div>

        <div
          style={{
            marginBottom: 12,
            wordBreak: "break-word",
          }}
        >
          <b>Đề tài:</b> {selectedRecord?.topicTitle || "-"}
        </div>

        <InputNumber
          min={0}
          max={10}
          step={0.1}
          value={score}
          onChange={(value) => setScore(value)}
          style={{ width: "100%" }}
          placeholder="Nhập điểm từ 0 đến 10"
        />
      </Modal>
    </div>
  );
}