import { useMemo, useState } from "react";
import {
  Card,
  Button,
  Row,
  Col,
  Typography,
  Statistic,
  Table,
  Tag,
  Progress,
  List,
  Space,
  Select,
} from "antd";
import { useNavigate } from "react-router-dom";
import { MdAssignmentInd } from "react-icons/md";

const { Title, Text } = Typography;

export default function TeacherDashboard() {
  const navigate = useNavigate();

  const semesters = [
    {
      id: "SEM_2026_TT",
      name: "Kỳ thực tập 2026",
      type: "Thực tập",
      status: "Đang diễn ra",
    },
    {
      id: "SEM_2026_DATN",
      name: "Kỳ đồ án tốt nghiệp 2026",
      type: "Đồ án tốt nghiệp",
      status: "Đang diễn ra",
    },
    {
      id: "SEM_2025_DATN",
      name: "Kỳ đồ án tốt nghiệp 2025",
      type: "Đồ án tốt nghiệp",
      status: "Đã kết thúc",
    },
  ];

  const [selectedSemesterId, setSelectedSemesterId] = useState("SEM_2026_DATN");

  const fakeDashboardBySemester = {
    SEM_2026_TT: {
      summary: {
        totalStudents: 24,
        pendingTopics: 3,
        ungradedReports: 9,
        overdueReports: 5,
        pendingFinalReports: 0,
        avgScore: 7.4,
      },
      progressData: [
        { label: "Sinh viên đã có đề tài", percent: 75, value: "18/24" },
        { label: "Sinh viên đã nộp báo cáo tuần gần nhất", percent: 67, value: "16/24" },
        { label: "Báo cáo tuần đã được chấm", percent: 54, value: "13/24" },
        { label: "Sinh viên hoàn thành thực tập", percent: 12, value: "3/24" },
      ],
      deadlineRows: [
        {
          key: 1,
          name: "Báo cáo thực tập tuần 1",
          dueDate: "08/06/2026",
          submitted: 22,
          missing: 2,
          overdue: 1,
          graded: 20,
        },
        {
          key: 2,
          name: "Báo cáo thực tập tuần 2",
          dueDate: "15/06/2026",
          submitted: 19,
          missing: 5,
          overdue: 3,
          graded: 13,
        },
        {
          key: 3,
          name: "Báo cáo thực tập tuần 3",
          dueDate: "22/06/2026",
          submitted: 16,
          missing: 8,
          overdue: 5,
          graded: 10,
        },
      ],
      studentRows: [
        {
          key: 1,
          code: "SV001",
          name: "Nguyễn Văn An",
          topic: "Thực tập tại doanh nghiệp phần mềm",
          issue: "Chưa nộp báo cáo tuần 3",
          avgScore: 7.1,
          status: "warning",
        },
        {
          key: 2,
          code: "SV002",
          name: "Trần Thị Bình",
          topic: "Thực tập phát triển website",
          issue: "Đề tài chờ duyệt",
          avgScore: null,
          status: "processing",
        },
        {
          key: 3,
          code: "SV003",
          name: "Lê Minh Cường",
          topic: "Thực tập kiểm thử phần mềm",
          issue: "Nộp báo cáo muộn",
          avgScore: 6.8,
          status: "error",
        },
      ],
    },

    SEM_2026_DATN: {
      summary: {
        totalStudents: 28,
        pendingTopics: 5,
        ungradedReports: 12,
        overdueReports: 4,
        pendingFinalReports: 3,
        avgScore: 7.8,
      },
      progressData: [
        { label: "Sinh viên đã có đề tài", percent: 82, value: "23/28" },
        { label: "Sinh viên đã nộp báo cáo tuần gần nhất", percent: 71, value: "20/28" },
        { label: "Báo cáo tuần đã được chấm", percent: 57, value: "16/28" },
        { label: "Sinh viên đã nộp final report", percent: 21, value: "6/28" },
      ],
      deadlineRows: [
        {
          key: 1,
          name: "Báo cáo tuần 1",
          dueDate: "10/06/2026",
          submitted: 26,
          missing: 2,
          overdue: 1,
          graded: 24,
        },
        {
          key: 2,
          name: "Báo cáo tuần 2",
          dueDate: "17/06/2026",
          submitted: 24,
          missing: 4,
          overdue: 2,
          graded: 18,
        },
        {
          key: 3,
          name: "Báo cáo tuần 3",
          dueDate: "24/06/2026",
          submitted: 20,
          missing: 8,
          overdue: 4,
          graded: 16,
        },
        {
          key: 4,
          name: "Nộp báo cáo cuối kỳ",
          dueDate: "30/06/2026",
          submitted: 6,
          missing: 22,
          overdue: 0,
          graded: 0,
        },
      ],
      studentRows: [
        {
          key: 1,
          code: "SV001",
          name: "Nguyễn Văn An",
          topic: "Website quản lý thực tập",
          issue: "Chưa nộp báo cáo tuần 3",
          avgScore: 7.2,
          status: "warning",
        },
        {
          key: 2,
          code: "SV002",
          name: "Trần Thị Bình",
          topic: "Ứng dụng đặt lịch khám",
          issue: "Đề tài chờ duyệt",
          avgScore: null,
          status: "processing",
        },
        {
          key: 3,
          code: "SV003",
          name: "Lê Minh Cường",
          topic: "Website bán hàng bạc",
          issue: "Final report chờ review",
          avgScore: 8.1,
          status: "success",
        },
        {
          key: 4,
          code: "SV004",
          name: "Phạm Quốc Dũng",
          topic: "Hệ thống quản lý kho",
          issue: "Điểm báo cáo thấp",
          avgScore: 5.8,
          status: "error",
        },
      ],
    },

    SEM_2025_DATN: {
      summary: {
        totalStudents: 20,
        pendingTopics: 0,
        ungradedReports: 0,
        overdueReports: 0,
        pendingFinalReports: 0,
        avgScore: 8.2,
      },
      progressData: [
        { label: "Sinh viên đã có đề tài", percent: 100, value: "20/20" },
        { label: "Sinh viên đã nộp báo cáo tuần cuối", percent: 100, value: "20/20" },
        { label: "Báo cáo tuần đã được chấm", percent: 100, value: "20/20" },
        { label: "Sinh viên đã nộp final report", percent: 100, value: "20/20" },
      ],
      deadlineRows: [
        {
          key: 1,
          name: "Báo cáo tuần 1",
          dueDate: "10/06/2025",
          submitted: 20,
          missing: 0,
          overdue: 0,
          graded: 20,
        },
        {
          key: 2,
          name: "Báo cáo tuần 2",
          dueDate: "17/06/2025",
          submitted: 20,
          missing: 0,
          overdue: 0,
          graded: 20,
        },
        {
          key: 3,
          name: "Nộp báo cáo cuối kỳ",
          dueDate: "30/06/2025",
          submitted: 20,
          missing: 0,
          overdue: 0,
          graded: 20,
        },
      ],
      studentRows: [
        {
          key: 1,
          code: "SV021",
          name: "Hoàng Minh Đức",
          topic: "Hệ thống quản lý sinh viên",
          issue: "Đã hoàn thành",
          avgScore: 8.4,
          status: "success",
        },
        {
          key: 2,
          code: "SV022",
          name: "Nguyễn Thu Hà",
          topic: "Website quản lý bán hàng",
          issue: "Đã hoàn thành",
          avgScore: 8.0,
          status: "success",
        },
      ],
    },
  };

  const selectedSemester = useMemo(() => {
    return semesters.find((item) => item.id === selectedSemesterId);
  }, [selectedSemesterId]);

  const dashboardData = fakeDashboardBySemester[selectedSemesterId];

  const stats = [
    {
      title: "Sinh viên hướng dẫn",
      value: dashboardData.summary.totalStudents,
      suffix: "SV",
      color: "#1677ff",
      path: "/teacher/students",
    },
    {
      title: "Đề tài chờ duyệt",
      value: dashboardData.summary.pendingTopics,
      suffix: "đề tài",
      color: "#faad14",
      path: "/teacher/topics",
    },
    {
      title: "Báo cáo chưa chấm",
      value: dashboardData.summary.ungradedReports,
      suffix: "báo cáo",
      color: "#722ed1",
      path: "/teacher/deadlines",
    },
    {
      title: "Báo cáo quá hạn",
      value: dashboardData.summary.overdueReports,
      suffix: "SV",
      color: "#ff4d4f",
      path: "/teacher/deadlines",
    },
    {
      title: "Final report chờ review",
      value: dashboardData.summary.pendingFinalReports,
      suffix: "báo cáo",
      color: "#13c2c2",
      path: "/teacher/final-reports",
    },
    {
      title: "Điểm trung bình",
      value: dashboardData.summary.avgScore,
      suffix: "/10",
      color: "#52c41a",
      path: "/teacher/scores",
    },
  ];

  const taskList = [
    {
      title: `Có ${dashboardData.summary.pendingTopics} đề tài đang chờ duyệt`,
      desc: "Sinh viên đã đăng ký đề tài, cần xem xét và phản hồi.",
      button: "Duyệt đề tài",
      path: "/teacher/topics",
      type: "warning",
      show: dashboardData.summary.pendingTopics > 0,
    },
    {
      title: `Có ${dashboardData.summary.ungradedReports} báo cáo tuần chưa được chấm`,
      desc: "Các báo cáo đã nộp nhưng chưa có điểm hoặc nhận xét.",
      button: "Chấm báo cáo",
      path: "/teacher/deadlines",
      type: "processing",
      show: dashboardData.summary.ungradedReports > 0,
    },
    {
      title: `Có ${dashboardData.summary.overdueReports} sinh viên quá hạn báo cáo`,
      desc: "Cần nhắc sinh viên nộp báo cáo hoặc xử lý quá hạn.",
      button: "Xem danh sách",
      path: "/teacher/deadlines",
      type: "error",
      show: dashboardData.summary.overdueReports > 0,
    },
    {
      title: `Có ${dashboardData.summary.pendingFinalReports} báo cáo cuối kỳ chờ review`,
      desc: "Sinh viên đã nộp báo cáo cuối kỳ, giảng viên cần kiểm tra.",
      button: "Review ngay",
      path: "/teacher/final-reports",
      type: "success",
      show: dashboardData.summary.pendingFinalReports > 0,
    },
  ].filter((item) => item.show);

  const deadlineColumns = [
    {
      title: "Deadline",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Hạn nộp",
      dataIndex: "dueDate",
      key: "dueDate",
    },
    {
      title: "Đã nộp",
      dataIndex: "submitted",
      key: "submitted",
      render: (value) => <Tag color="green">{value}</Tag>,
    },
    {
      title: "Chưa nộp",
      dataIndex: "missing",
      key: "missing",
      render: (value) => <Tag color={value > 0 ? "orange" : "green"}>{value}</Tag>,
    },
    {
      title: "Quá hạn",
      dataIndex: "overdue",
      key: "overdue",
      render: (value) => <Tag color={value > 0 ? "red" : "green"}>{value}</Tag>,
    },
    {
      title: "Đã chấm",
      dataIndex: "graded",
      key: "graded",
      render: (value) => <Tag color="blue">{value}</Tag>,
    },
  ];

  const studentColumns = [
    {
      title: "Mã SV",
      dataIndex: "code",
      key: "code",
      width: 100,
    },
    {
      title: "Sinh viên",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Đề tài",
      dataIndex: "topic",
      key: "topic",
    },
    {
      title: "Vấn đề cần chú ý",
      dataIndex: "issue",
      key: "issue",
      render: (text, record) => {
        const colorMap = {
          warning: "orange",
          processing: "blue",
          success: "green",
          error: "red",
        };

        return <Tag color={colorMap[record.status]}>{text}</Tag>;
      },
    },
    {
      title: "Điểm TB",
      dataIndex: "avgScore",
      key: "avgScore",
      align: "center",
      render: (value) =>
        value ? <Text strong>{value}</Text> : <Text type="secondary">Chưa có</Text>,
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: () => (
        <Button size="small" onClick={() => navigate("/teacher/students")}>
          Xem
        </Button>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: 24,
        background: "#f5f7fb",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space align="center">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "#1677ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 26,
              }}
            >
              <MdAssignmentInd />
            </div>

            <div>
              <Title level={3} style={{ margin: 0 }}>
                Dashboard giảng viên
              </Title>
              <Text type="secondary">
                Theo dõi sinh viên hướng dẫn, deadline, báo cáo và điểm số theo từng kỳ
              </Text>
            </div>
          </Space>
        </Col>

        <Col>
          <Space>
            <Select
              value={selectedSemesterId}
              onChange={setSelectedSemesterId}
              style={{ width: 280 }}
              options={semesters.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
            />

            <Button onClick={() => navigate("/teacher/deadlines")}>
              Quản lý deadline
            </Button>

            <Button type="primary" onClick={() => navigate("/teacher/students")}>
              Xem sinh viên
            </Button>
          </Space>
        </Col>
      </Row>

      <Card
        style={{
          borderRadius: 14,
          marginBottom: 16,
          border: "1px solid #edf0f5",
        }}
        bodyStyle={{ padding: 16 }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Text strong>Đang xem:</Text>
              <Tag color="blue">{selectedSemester?.name}</Tag>
              <Tag color="purple">{selectedSemester?.type}</Tag>
              <Tag color={selectedSemester?.status === "Đang diễn ra" ? "green" : "default"}>
                {selectedSemester?.status}
              </Tag>
            </Space>
          </Col>

          <Col>
            <Text type="secondary">
              Dữ liệu thống kê được lọc theo kỳ đang chọn
            </Text>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {stats.map((item, index) => (
          <Col xs={24} sm={12} md={8} xl={4} key={index}>
            <Card
              hoverable
              onClick={() => navigate(item.path)}
              style={{
                borderRadius: 14,
                border: "1px solid #edf0f5",
                cursor: "pointer",
              }}
              bodyStyle={{ padding: 18 }}
            >
              <Statistic
                title={<Text type="secondary">{item.title}</Text>}
                value={item.value}
                suffix={item.suffix}
                valueStyle={{
                  color: item.color,
                  fontWeight: 700,
                  fontSize: 24,
                }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={15}>
          <Card
            title="Tiến độ sinh viên hướng dẫn"
            style={{ borderRadius: 14 }}
            bodyStyle={{ paddingTop: 10 }}
          >
            {dashboardData.progressData.map((item, index) => (
              <div key={index} style={{ marginBottom: 18 }}>
                <Row justify="space-between" style={{ marginBottom: 6 }}>
                  <Text>{item.label}</Text>
                  <Text strong>{item.value}</Text>
                </Row>
                <Progress percent={item.percent} />
              </div>
            ))}
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <Card
            title="Việc cần xử lý"
            style={{ borderRadius: 14 }}
            bodyStyle={{ paddingTop: 4 }}
          >
            {taskList.length > 0 ? (
              <List
                dataSource={taskList}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        size="small"
                        type={item.type === "error" ? "primary" : "default"}
                        danger={item.type === "error"}
                        onClick={() => navigate(item.path)}
                      >
                        {item.button}
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Tag color={item.type === "error" ? "red" : item.type}>
                            {item.type === "error" ? "Cần chú ý" : "Cần xử lý"}
                          </Tag>
                          <Text strong>{item.title}</Text>
                        </Space>
                      }
                      description={item.desc}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: "center", padding: "28px 0" }}>
                <Text type="secondary">Không có việc cần xử lý trong kỳ này</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card
            title="Tình trạng nộp báo cáo theo deadline"
            extra={
              <Button size="small" onClick={() => navigate("/teacher/deadlines")}>
                Xem tất cả
              </Button>
            }
            style={{ borderRadius: 14 }}
          >
            <Table
              columns={deadlineColumns}
              dataSource={dashboardData.deadlineRows}
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card
            title="Sinh viên cần chú ý"
            extra={
              <Button size="small" onClick={() => navigate("/teacher/students")}>
                Xem danh sách sinh viên
              </Button>
            }
            style={{ borderRadius: 14 }}
          >
            <Table
              columns={studentColumns}
              dataSource={dashboardData.studentRows}
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}