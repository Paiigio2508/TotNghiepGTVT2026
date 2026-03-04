import {
  Table,
  Button,
  Tag,
  Typography,
  Divider,
  message,
  Input,
  Select,
  Row,
  Col,
  Progress,
  Statistic,
  Card,
} from "antd";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DeadlineAPI } from "../../api/DeadlineAPI";

const { Title, Text } = Typography;
const { Option } = Select;

export default function DeadlineReports() {
  const { deadlineId } = useParams();
  const navigate = useNavigate();

  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const userData = JSON.parse(localStorage.getItem("userData"));
  const userId = userData?.userId;

  /* ================= LOAD REPORT ================= */

  const loadReports = async () => {
    try {
      setLoading(true);

      const res = await DeadlineAPI.getTeacherReports(deadlineId, userId);
      console.log(res.data);
      const safeData = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      setReportData(safeData);
      setFilteredData(safeData);
    } catch {
      message.error("Tải danh sách sinh viên thất bại!");
      setReportData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [deadlineId]);

  /* ================= FILTER ================= */

  useEffect(() => {
    let data = [...reportData];

    if (searchText) {
      data = data.filter(
        (item) =>
          item.studentName?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.studentCode?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (statusFilter !== "ALL") {
      data = data.filter((item) => item.status === statusFilter);
    }

    setFilteredData(data);
  }, [searchText, statusFilter, reportData]);

  /* ================= STATISTICS ================= */

  const totalStudents = reportData.length;

  const submittedCount = reportData.filter(
    (s) => s.status === "SUBMITTED"
  ).length;

  const lateCount = reportData.filter((s) => s.status === "LATE").length;

  const notSubmittedCount = reportData.filter(
    (s) => s.status === "CHUA_NOP"
  ).length;

  const percent =
    totalStudents === 0
      ? 0
      : Math.round((submittedCount / totalStudents) * 100);

  /* ================= DOWNLOAD ZIP ================= */

  const handleDownloadAll = async () => {
    try {
      const res = await DeadlineAPI.downloadAllReports(deadlineId, userId);

      const blob = new Blob([res.data], { type: "application/zip" });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = `Reports_${deadlineId}.zip`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      message.error("Download thất bại!");
    }
  };
  const downloadFile = async (url, filename) => {
    const response = await fetch(url);

    const blob = await response.blob();

    const link = document.createElement("a");

    link.href = window.URL.createObjectURL(blob);

    link.download = filename;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };
  /* ================= TABLE ================= */

  const columns = [
    {
      title: "Mã",
      dataIndex: "studentCode",
      width: 120,
    },
    {
      title: "Sinh viên",
      dataIndex: "studentName",
    },
    {
      title: "Lớp",
      dataIndex: "studentClass",
      width: 120,
    },
    {
      title: "File báo cáo",
      width: 260,
      render: (_, record) => {
        if (!record.fileUrl) {
          return <Tag color="red">Chưa nộp</Tag>;
        }

        return (
          <a
            style={{
              color: "#1677ff",
              textDecoration: "underline",
              cursor: "pointer",
            }}
            onClick={() =>
              downloadFile(record.fileUrl, record.originalFileName)
            }
          >
            {record.originalFileName}
          </a>
        );
      },
    },
    {
      title: "Trạng thái",
      width: 140,
      render: (_, record) => {
        if (record.status === "SUBMITTED")
          return <Tag color="green">Đã nộp</Tag>;

        if (record.status === "CHUA_NOP")
          return <Tag color="red">Chưa nộp</Tag>;

        return <Tag color="orange">Nộp trễ</Tag>;
      },
    },
  ];

  return (
    <>
      <Divider>
        <Title level={3}>Danh sách sinh viên nộp báo cáo</Title>
        <Text type="secondary">Tổng sinh viên: {reportData.length}</Text>
      </Divider>
      <Col className="mb-2">
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
      </Col>
      {/* ===== DASHBOARD STATISTICS ===== */}

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Đã nộp"
              value={submittedCount}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Statistic
              title="Chưa nộp"
              value={notSubmittedCount}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Statistic
              title="Nộp trễ"
              value={lateCount}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      {/* ===== PROGRESS ===== */}

      <div style={{ marginBottom: 20 }}>
        <Text strong>
          Đã nộp: {submittedCount} / {totalStudents} ({percent}%)
        </Text>

        <Progress percent={percent} />
      </div>

      {/* ===== ACTION BAR ===== */}

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <Input.Search
            placeholder="Tìm tên hoặc mã sinh viên"
            allowClear
            style={{ width: 250 }}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Col>

        <Col>
          <Select
            value={statusFilter}
            style={{ width: 180 }}
            onChange={(value) => setStatusFilter(value)}
          >
            <Option value="ALL">Tất cả</Option>
            <Option value="SUBMITTED">Đã nộp</Option>
            <Option value="CHUA_NOP">Chưa nộp</Option>
            <Option value="LATE">Nộp trễ</Option>
          </Select>
        </Col>
        <Col>
          <Button type="primary" onClick={handleDownloadAll}>
            Download tất cả
          </Button>
        </Col>
      </Row>

      {/* ===== TABLE ===== */}

      <Table
        rowKey="studentId"
        dataSource={filteredData}
        columns={columns}
        loading={loading}
        bordered
        pagination={{ pageSize: 8 }}
      />
    </>
  );
}
