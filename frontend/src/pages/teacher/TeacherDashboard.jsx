import { useEffect, useMemo, useState } from "react";
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
  Spin,
  Empty,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import { MdAssignmentInd } from "react-icons/md";
import { TermAPI } from "../../api/TermAPI";
import { TeacherDashboardAPI } from "../../api/TeacherDashboardAPI";


const { Title, Text } = Typography;
const { Option } = Select;

const emptyDashboardData = {
  thongKeTongQuan: {
    tongSinhVien: 0,
    deTaiChoDuyet: 0,
    baoCaoChuaCham: 0,
    baoCaoQuaHan: 0,
    baoCaoCuoiKyChoReview: 0,
    diemTrungBinh: 0,
  },
  tienDoSinhVien: [],
  danhSachDeadline: [],
  danhSachSinhVienCanChuY: [],
};

export default function TeacherDashboard() {
  const navigate = useNavigate();

  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [dashboardData, setDashboardData] = useState(emptyDashboardData);

  const [loadingTerm, setLoadingTerm] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  /* ================= LOAD TERM ================= */
  useEffect(() => {
    loadInternShipTerm();
  }, []);

  const loadInternShipTerm = async () => {
    try {
      setLoadingTerm(true);

      const res = await TermAPI.getAllTermForTeacherLayout();
      const termList = res.data || [];

      setTerms(termList);

      if (termList.length > 0) {
        const currentTerm = termList.find(
          (term) => term.status === "DANG_DIEN_RA"
        );

        setSelectedTerm(currentTerm ? currentTerm.id : termList[0].id);
      } else {
        setSelectedTerm(null);
        setDashboardData(emptyDashboardData);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách kỳ:", error);
      message.error("Tải danh sách học kỳ thất bại!");
      setTerms([]);
      setSelectedTerm(null);
      setDashboardData(emptyDashboardData);
    } finally {
      setLoadingTerm(false);
    }
  };

  /* ================= LOAD DASHBOARD ================= */
  const loadDashboard = async (termId) => {
    if (!termId) {
      setDashboardData(emptyDashboardData);
      return;
    }

    try {
      setLoadingDashboard(true);

      const res = await TeacherDashboardAPI.layThongKeDashboard(termId);
      const data = res.data || {};

      setDashboardData({
        ...emptyDashboardData,
        ...data,
        thongKeTongQuan: {
          ...emptyDashboardData.thongKeTongQuan,
          ...(data.thongKeTongQuan || {}),
        },
        tienDoSinhVien: data.tienDoSinhVien || [],
        danhSachDeadline: data.danhSachDeadline || [],
        danhSachSinhVienCanChuY: data.danhSachSinhVienCanChuY || [],
      });
    } catch (error) {
      console.error("Lỗi tải dashboard giảng viên:", error);
      message.error("Tải thống kê dashboard thất bại!");
      setDashboardData(emptyDashboardData);
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    if (selectedTerm) {
      loadDashboard(selectedTerm);
    }
  }, [selectedTerm]);

  const handleTermChange = (value) => {
    setSelectedTerm(value);

    if (!value) {
      setDashboardData(emptyDashboardData);
    }
  };

  const selectedTermData = useMemo(() => {
    return terms.find((term) => term.id === selectedTerm);
  }, [terms, selectedTerm]);

  const thongKe =
    dashboardData.thongKeTongQuan || emptyDashboardData.thongKeTongQuan;

  const renderTermStatus = (status) => {
    const statusMap = {
      CHUA_DIEN_RA: { text: "Chưa diễn ra", color: "default" },
      DANG_DIEN_RA: { text: "Đang diễn ra", color: "green" },
      DA_KET_THUC: { text: "Đã kết thúc", color: "red" },
    };

    const current = statusMap[status] || {
      text: status || "Không xác định",
      color: "default",
    };

    return <Tag color={current.color}>{current.text}</Tag>;
  };

  const getLoaiKy = (termName) => {
    if (!termName) return "Kỳ thực tập / đồ án";

    const name = termName.toLowerCase();

    if (
      name.includes("đồ án") ||
      name.includes("do an") ||
      name.includes("datn")
    ) {
      return "Đồ án tốt nghiệp";
    }

    if (name.includes("thực tập") || name.includes("thuc tap")) {
      return "Thực tập";
    }

    return "Kỳ thực tập / đồ án";
  };

  const stats = [
    {
      title: "Sinh viên hướng dẫn",
      value: thongKe.tongSinhVien,
      suffix: "SV",
      color: "#1677ff",
      path: "/teacher/students",
    },
    {
      title: "Đề tài chờ duyệt",
      value: thongKe.deTaiChoDuyet,
      suffix: "đề tài",
      color: "#faad14",
      path: "/teacher/topics",
    },
    {
      title: "Báo cáo chưa chấm",
      value: thongKe.baoCaoChuaCham,
      suffix: "báo cáo",
      color: "#722ed1",
      path: "/teacher/deadlines",
    },
    {
      title: "Báo cáo quá hạn",
      value: thongKe.baoCaoQuaHan,
      suffix: "SV",
      color: "#ff4d4f",
      path: "/teacher/deadlines",
    },
    {
      title: "Final report chờ review",
      value: thongKe.baoCaoCuoiKyChoReview,
      suffix: "báo cáo",
      color: "#13c2c2",
      path: "/teacher/final-reports",
    },
    {
      title: "Điểm trung bình",
      value: thongKe.diemTrungBinh,
      suffix: "/10",
      color: "#52c41a",
      path: "/teacher/scores",
    },
  ];

  const taskList = [
    {
      title: `Có ${thongKe.deTaiChoDuyet} đề tài đang chờ duyệt`,
      desc: "Sinh viên đã đăng ký đề tài, cần xem xét và phản hồi.",
      button: "Duyệt đề tài",
      path: "/teacher/topics",
      type: "warning",
      show: thongKe.deTaiChoDuyet > 0,
    },
    {
      title: `Có ${thongKe.baoCaoChuaCham} báo cáo tuần chưa được chấm`,
      desc: "Các báo cáo đã nộp nhưng chưa có điểm hoặc nhận xét.",
      button: "Chấm báo cáo",
      path: "/teacher/deadlines",
      type: "processing",
      show: thongKe.baoCaoChuaCham > 0,
    },
    {
      title: `Có ${thongKe.baoCaoQuaHan} sinh viên quá hạn báo cáo`,
      desc: "Cần nhắc sinh viên nộp báo cáo hoặc xử lý quá hạn.",
      button: "Xem danh sách",
      path: "/teacher/deadlines",
      type: "error",
      show: thongKe.baoCaoQuaHan > 0,
    },
    {
      title: `Có ${thongKe.baoCaoCuoiKyChoReview} báo cáo cuối kỳ chờ review`,
      desc: "Sinh viên đã nộp báo cáo cuối kỳ, giảng viên cần kiểm tra.",
      button: "Review ngay",
      path: "/teacher/final-reports",
      type: "success",
      show: thongKe.baoCaoCuoiKyChoReview > 0,
    },
  ].filter((item) => item.show);

  const deadlineColumns = [
    {
      title: "Deadline",
      dataIndex: "tenDeadline",
      key: "tenDeadline",
      render: (text) => <Text strong>{text || "Chưa có tên"}</Text>,
    },
    {
      title: "Hạn nộp",
      dataIndex: "hanNop",
      key: "hanNop",
      render: (text) => text || <Text type="secondary">---</Text>,
    },
    {
      title: "Đã nộp",
      dataIndex: "daNop",
      key: "daNop",
      render: (value) => <Tag color="green">{value || 0}</Tag>,
    },
    {
      title: "Chưa nộp",
      dataIndex: "chuaNop",
      key: "chuaNop",
      render: (value) => (
        <Tag color={value > 0 ? "orange" : "green"}>{value || 0}</Tag>
      ),
    },
    {
      title: "Quá hạn",
      dataIndex: "quaHan",
      key: "quaHan",
      render: (value) => (
        <Tag color={value > 0 ? "red" : "green"}>{value || 0}</Tag>
      ),
    },
    {
      title: "Đã chấm",
      dataIndex: "daCham",
      key: "daCham",
      render: (value) => <Tag color="blue">{value || 0}</Tag>,
    },
  ];

  const studentColumns = [
    {
      title: "Mã SV",
      dataIndex: "maSinhVien",
      key: "maSinhVien",
      width: 110,
      render: (text) => text || <Text type="secondary">---</Text>,
    },
    {
      title: "Sinh viên",
      dataIndex: "tenSinhVien",
      key: "tenSinhVien",
      render: (text) => <Text strong>{text || "Sinh viên"}</Text>,
    },
    {
      title: "Đề tài",
      dataIndex: "tenDeTai",
      key: "tenDeTai",
      render: (text) => text || <Text type="secondary">Chưa cập nhật</Text>,
    },
    {
      title: "Vấn đề cần chú ý",
      dataIndex: "vanDeCanChuY",
      key: "vanDeCanChuY",
      render: (text, record) => {
        const colorMap = {
          warning: "orange",
          processing: "blue",
          success: "green",
          error: "red",
        };

        return (
          <Tag color={colorMap[record.trangThai] || "default"}>
            {text || "Cần kiểm tra"}
          </Tag>
        );
      },
    },
    {
      title: "Điểm TB",
      dataIndex: "diemTrungBinh",
      key: "diemTrungBinh",
      align: "center",
      render: (value) =>
        value !== null && value !== undefined ? (
          <Text strong>{value}</Text>
        ) : (
          <Text type="secondary">Chưa có</Text>
        ),
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
              value={selectedTerm}
              loading={loadingTerm}
              style={{ width: 280 }}
              placeholder="Chọn kỳ"
              onChange={handleTermChange}
            >
              {terms.map((term) => (
                <Option key={term.id} value={term.id}>
                  {term.name} {term.academicYear ? `(${term.academicYear})` : ""}
                </Option>
              ))}
            </Select>

            <Button onClick={() => navigate("/teacher/deadlines")}>
              Quản lý deadline
            </Button>

            <Button type="primary" onClick={() => navigate("/teacher/students")}>
              Xem sinh viên
            </Button>
          </Space>
        </Col>
      </Row>

      {loadingTerm ? (
        <Card style={{ borderRadius: 14 }}>
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Spin />
          </div>
        </Card>
      ) : terms.length === 0 ? (
        <Card style={{ borderRadius: 14 }}>
          <Empty description="Giảng viên chưa có kỳ hướng dẫn nào" />
        </Card>
      ) : (
        <Spin spinning={loadingDashboard}>
          <Card
            style={{
              borderRadius: 14,
              marginBottom: 16,
              border: "1px solid #edf0f5",
            }}
            styles={{ body: { padding: 16 } }}
          >
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <Text strong>Đang xem:</Text>
                  <Tag color="blue">{selectedTermData?.name}</Tag>
                  {selectedTermData?.academicYear && (
                    <Tag color="purple">{selectedTermData.academicYear}</Tag>
                  )}
                  <Tag color="cyan">{getLoaiKy(selectedTermData?.name)}</Tag>
                  {renderTermStatus(selectedTermData?.status)}
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
                  styles={{ body: { padding: 18 } }}
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
                styles={{ body: { paddingTop: 10 } }}
              >
                {dashboardData.tienDoSinhVien.length > 0 ? (
                  dashboardData.tienDoSinhVien.map((item, index) => (
                    <div key={index} style={{ marginBottom: 18 }}>
                      <Row justify="space-between" style={{ marginBottom: 6 }}>
                        <Text>{item.noiDung}</Text>
                        <Text strong>{item.giaTri}</Text>
                      </Row>
                      <Progress percent={item.phanTram || 0} />
                    </div>
                  ))
                ) : (
                  <Empty description="Chưa có dữ liệu tiến độ" />
                )}
              </Card>
            </Col>

            <Col xs={24} lg={9}>
              <Card
                title="Việc cần xử lý"
                style={{ borderRadius: 14 }}
                styles={{ body: { paddingTop: 4 } }}
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
                    <Text type="secondary">
                      Không có việc cần xử lý trong kỳ này
                    </Text>
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
                  <Button
                    size="small"
                    onClick={() => navigate("/teacher/deadlines")}
                  >
                    Xem tất cả
                  </Button>
                }
                style={{ borderRadius: 14 }}
              >
                <Table
                  columns={deadlineColumns}
                  dataSource={dashboardData.danhSachDeadline}
                  rowKey="idDeadline"
                  pagination={false}
                  size="middle"
                  locale={{
                    emptyText: "Chưa có deadline nào trong kỳ này",
                  }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24}>
              <Card
                title="Sinh viên cần chú ý"
                extra={
                  <Button
                    size="small"
                    onClick={() => navigate("/teacher/students")}
                  >
                    Xem danh sách sinh viên
                  </Button>
                }
                style={{ borderRadius: 14 }}
              >
                <Table
                  columns={studentColumns}
                  dataSource={dashboardData.danhSachSinhVienCanChuY}
                  rowKey="idPhanCong"
                  pagination={false}
                  size="middle"
                  locale={{
                    emptyText: "Không có sinh viên cần chú ý",
                  }}
                />
              </Card>
            </Col>
          </Row>
        </Spin>
      )}
    </div>
  );
}