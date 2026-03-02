import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Descriptions,
  message,
} from "antd";
import { BookOutlined, CheckCircleOutlined, CloseCircleOutlined, UserOutlined } from "@ant-design/icons";
import { TermAPI } from "../../api/TermAPI";
import { useState, useEffect } from "react";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [studentId, setStudentId] = useState(null);

  // Lấy studentId
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsed = JSON.parse(userData);
      setStudentId(parsed.userId);
    }
  }, []);

  // Gọi API
  useEffect(() => {
    if (!studentId) return;

    const loadTermStudent = async () => {
      try {
        const res = await TermAPI.getinternshipsStudent(studentId);

        // Nếu backend trả array → lấy phần tử đầu
        const result = Array.isArray(res.data) ? res.data[0] : res.data;
        console.log(result);
        setData(result || null);
      } catch (err) {
        message.error("Tải dữ liệu thất bại!");
      }
    };

    loadTermStudent();
  }, [studentId]);

  const renderStatusTag = (status) => {
    switch (status) {
      case "DANG_DIEN_RA":
        return <Tag color="green">Đang diễn ra</Tag>;
      case "SAP_DIEN_RA":
        return <Tag color="blue">Sắp diễn ra</Tag>;
      case "KET_THUC":
        return <Tag color="red">Kết thúc</Tag>;
      default:
        return <Tag>Chưa có</Tag>;
    }
  };

return (
  <>
    <Title level={2} className="text-center mb-6">
      🎓 Dashboard Sinh Viên
    </Title>

    <Row gutter={[24, 24]}>
      {/* THÔNG TIN SINH VIÊN - FULL HÀNG */}
      <Col span={24}>
        <Card
          title="📌 Thông tin sinh viên"
          variant="outlined"
          style={{
            border: "1.5px solid #d9d9d9",
            borderRadius: 12,
          }}
        >
          <Descriptions column={2} size="middle">
            <Descriptions.Item label="Mã sinh viên">
              {data?.studentCode || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Tên sinh viên">
              {data?.studentName || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Tên sinh viên">
              {data?.studentPhone || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Tên sinh viên">
              {data?.studentEmail || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Lớp">
              {data?.studentClassName || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Ngành">
              {data?.studentMajor || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái">
              {data?.studentStatus === "DU_DIEU_KIEN" ? (
                <Tag
                  icon={<CheckCircleOutlined />}
                  className="fs-6"
                  color="success"
                >
                  Đủ điều kiện
                </Tag>
              ) : data?.studentStatus === "KHONG_DU_DIEU_KIEN" ? (
                <Tag
                  icon={<CloseCircleOutlined />}
                  className="fs-6"
                  color="error"
                >
                  Không đủ điều kiện
                </Tag>
              ) : (
                <Tag color="default">Chưa xác định</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>

      {/* HỌC KỲ - 50% */}
      <Col xs={24} md={12}>
        <Card
          title={
            <>
              <BookOutlined /> Học kỳ thực tập
            </>
          }
          hoverable
          className="shadow-md rounded-xl"
        >
          <Descriptions column={1} size="middle">
            <Descriptions.Item label="Tên học kỳ">
              {data?.nameIntern || "Chưa có"}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian học kỳ">
              {data?.startDate && data?.endDate
                ? `${dayjs(data.startDate).format("DD/MM/YYYY")} - ${dayjs(
                    data.endDate
                  ).format("DD/MM/YYYY")}`
                : "Chưa có"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {renderStatusTag(data?.termStatus)}
            </Descriptions.Item>

            <Descriptions.Item label="Hạn đăng ký">
              {data?.registrationDeadline
                ? dayjs(data.registrationDeadline).format("DD/MM/YYYY")
                : "Chưa có"}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>

      {/* GIẢNG VIÊN - 50% */}
      <Col xs={24} md={12}>
        <Card
          title={
            <>
              <UserOutlined /> Giảng viên hướng dẫn
            </>
          }
          hoverable
          className="shadow-md rounded-xl"
        >
          <Descriptions column={1} size="middle">
            <Descriptions.Item label="Họ tên">
              {data?.teacherName || "Chưa phân công"}
            </Descriptions.Item>

            <Descriptions.Item label="Email">
              {data?.teacherEmail || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="SĐT">
              {data?.teacherPhone || "-"}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>

      {/* TRẠNG THÁI ĐỀ TÀI - FULL */}
      {/* TRẠNG THÁI ĐỀ TÀI - FULL */}
      <Col span={24}>
        <Card
          title="📚 Trạng thái đề tài"
          hoverable
          className="shadow-md rounded-xl text-center"
        >
          {!data?.topicName ? (
            <>
              <Title level={4}>Bạn chưa đăng ký đề tài</Title>

              <Text type="secondary">Vui lòng đăng ký đề tài trước hạn.</Text>

              <div className="mt-4">
                <Button
                  type="primary"
                  size="large"
                  href="http://localhost:5173/student/topic"
                >
                  Đăng ký đề tài
                </Button>
              </div>
            </>
          ) : (
            <>
              <Title level={4}>{data.topicName}</Title>

              <Text type="secondary">
                {data.topicDescription || "Không có mô tả"}
              </Text>
            </>
          )}
        </Card>
      </Col>
    </Row>
  </>
);
}
