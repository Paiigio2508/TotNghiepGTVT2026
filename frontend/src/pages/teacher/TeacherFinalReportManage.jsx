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
  Popconfirm,
  Tooltip,
} from "antd";
import { useState, useEffect, useMemo } from "react";
import { FaFileAlt } from "react-icons/fa";
import {
  EyeOutlined,
  CheckOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { TermAPI } from "../../api/TermAPI";
import { FinalReportAPI } from "../../api/FinalReportAPI";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

export default function TeacherFinalReportManage() {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const userId = userData?.userId;

  const [data, setData] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const [openRevisionModal, setOpenRevisionModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [comment, setComment] = useState("");
  const [submittingRevision, setSubmittingRevision] = useState(false);

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
      const res = await TermAPI.getAllTermForTeacherLayout();

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
    if (selectedTerm && userId) {
      loadFinalReports(selectedTerm);
    } else {
      setData([]);
    }
  }, [selectedTerm, userId]);

  const loadFinalReports = async (termId) => {
    try {
      setLoading(true);

      const res = await FinalReportAPI.getByTeacherUserAndTerm(userId, termId);

      setData(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log(error);
      message.error("Tải danh sách báo cáo cuối kỳ thất bại!");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFile = (fileUrl) => {
    if (!fileUrl) {
      toast.warning("Không tìm thấy file báo cáo!");
      return;
    }

    window.open(fileUrl, "_blank");
  };

  const openRevision = (record) => {
    setSelectedRecord(record);
    setComment(record.comment || "");
    setOpenRevisionModal(true);
  };

  const handleRequestRevision = async () => {
    if (!selectedRecord?.id) {
      toast.warning("Không tìm thấy báo cáo!");
      return;
    }

    if (!comment.trim()) {
      toast.warning("Vui lòng nhập nhận xét yêu cầu sửa!");
      return;
    }

    try {
      setSubmittingRevision(true);

      await FinalReportAPI.requestRevision(selectedRecord.id, {
        comment: comment.trim(),
      });

      toast.success("Đã yêu cầu sinh viên chỉnh sửa báo cáo!");

      setOpenRevisionModal(false);
      setSelectedRecord(null);
      setComment("");

      loadFinalReports(selectedTerm);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Yêu cầu chỉnh sửa thất bại!"
      );
    } finally {
      setSubmittingRevision(false);
    }
  };

  const handleTeacherApprove = async (record) => {
    try {
      await FinalReportAPI.teacherApprove(record.id);

      toast.success("Duyệt báo cáo thành công, đã gửi admin!");
      loadFinalReports(selectedTerm);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Duyệt báo cáo thất bại!"
      );
    }
  };

  const statusOptions = [
    { value: "SUBMITTED", label: "Đã nộp" },
    { value: "NEED_REVISION", label: "Cần sửa lại" },
    { value: "TEACHER_APPROVED", label: "Đã duyệt gửi Admin" },
    { value: "ADMIN_APPROVED", label: "Admin đã duyệt" },
    { value: "GRADED", label: "Đã chấm điểm" },
  ];

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchStatus = selectedStatus ? item.status === selectedStatus : true;

      const keyword = searchKeyword.trim().toLowerCase();

      const matchSearch = keyword
        ? item.studentCode?.toLowerCase().includes(keyword) ||
          item.studentName?.toLowerCase().includes(keyword) ||
          item.topicTitle?.toLowerCase().includes(keyword)
        : true;

      return matchStatus && matchSearch;
    });
  }, [data, selectedStatus, searchKeyword]);

  const renderStatus = (status) => {
    switch (status) {
      case "SUBMITTED":
        return <Tag color="blue">Đã nộp</Tag>;
      case "NEED_REVISION":
        return <Tag color="orange">Cần sửa lại</Tag>;
      case "TEACHER_APPROVED":
        return <Tag color="purple">Đã duyệt gửi Admin</Tag>;
      case "ADMIN_APPROVED":
        return <Tag color="green">Admin đã duyệt</Tag>;
      case "GRADED":
        return <Tag color="cyan">Đã chấm điểm</Tag>;
      default:
        return <Tag color="default">{status || "Chưa rõ"}</Tag>;
    }
  };

  const canTeacherHandle = (status) => {
    return status === "SUBMITTED";
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
      width: 160,
      render: (text) => (
        <Tooltip title={text}>
          <div style={{ ...ellipsisStyle, maxWidth: 140 }}>
            {text || "-"}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Đề tài",
      dataIndex: "topicTitle",
      width: 240,
      render: (text) => (
        <Tooltip title={text}>
          <div style={{ ...ellipsisStyle, maxWidth: 220 }}>
            {text || "-"}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "File",
      dataIndex: "originalFileName",
      width: 220,
      render: (text, record) => (
        <Tooltip title={text || "Xem file"}>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleOpenFile(record.fileUrl)}
            style={{
              padding: 0,
              maxWidth: 190,
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
      width: 155,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "Nhận xét",
      dataIndex: "comment",
      width: 180,
      render: (text) => {
        if (!text) return "-";

        return (
          <Tooltip title={text}>
            <div
              style={{
                maxWidth: 150,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              {text}
            </div>
          </Tooltip>
        );
      },
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
      width: 230,
      render: (_, record) => (
        <Space wrap>
          <Tooltip title="Yêu cầu sinh viên sửa lại">
            <Button
              icon={<EditOutlined />}
              disabled={!canTeacherHandle(record.status)}
              onClick={() => openRevision(record)}
            >
              Yêu cầu sửa
            </Button>
          </Tooltip>

          <Tooltip title="Duyệt báo cáo gửi admin">
            <Popconfirm
              title="Xác nhận duyệt báo cáo này?"
              okText="Duyệt"
              cancelText="Hủy"
              onConfirm={() => handleTeacherApprove(record)}
              disabled={!canTeacherHandle(record.status)}
            >
              <Button
                type="primary"
                icon={<CheckOutlined />}
                disabled={!canTeacherHandle(record.status)}
              >
                Duyệt
              </Button>
            </Popconfirm>
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
          <span>Duyệt báo cáo cuối kỳ</span>
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

      <div
        style={{
          width: "100%",
          maxWidth: "100%",
          overflowX: "auto",
          overflowY: "hidden",
        }}
      >
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
          scroll={{ x: 1515 }}
        />
      </div>

      <Modal
        title="Yêu cầu sinh viên chỉnh sửa báo cáo"
        open={openRevisionModal}
        onCancel={() => {
          setOpenRevisionModal(false);
          setSelectedRecord(null);
          setComment("");
        }}
        onOk={handleRequestRevision}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
        confirmLoading={submittingRevision}
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

        <TextArea
          rows={5}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Nhập nhận xét/yêu cầu chỉnh sửa cho sinh viên..."
        />
      </Modal>
    </div>
  );
}