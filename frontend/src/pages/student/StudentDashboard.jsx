import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Descriptions,
  message,
  Modal,
  Form,
  Select,
} from "antd";
import {
  BookOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import { TermAPI } from "../../api/TermAPI";
import { SpecializationAPI } from "../../api/SpecializationAPI";
import { StudentAPI } from "../../api/StudentAPI";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { toast } from "react-toastify";

const { Title, Text } = Typography;
const { Option } = Select;

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [openSpecialization, setOpenSpecialization] = useState(false);
  const [specializations, setSpecializations] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsed = JSON.parse(userData);
      setStudentId(parsed.userId);
    }
  }, []);

  useEffect(() => {
    if (!studentId) return;

    const loadTermStudent = async () => {
      try {
        const res = await TermAPI.getinternshipsStudent(studentId);
        const result = Array.isArray(res.data) ? res.data[0] : res.data;
        console.log("🚀 ~ loadTermStudent ~ result:", result)
        setData(result || null);
      } catch (err) {
        message.error("Tải dữ liệu thất bại!");
      }
    };

    loadTermStudent();
  }, [studentId]);

  useEffect(() => {
    const loadSpecializations = async () => {
      try {
        const res = await SpecializationAPI.getAllStudent();
        const raw = Array.isArray(res.data) ? res.data : [];
        setSpecializations(raw.filter((item) => item.status === 0));
      } catch (error) {
        console.log(error);
      }
    };

    loadSpecializations();
  }, []);

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

  const isAssigned = !!data?.teacherName;

  const handleOpenSpecialization = () => {
    form.setFieldsValue({
      specializationId: data?.specializationId || undefined,
    });
    setOpenSpecialization(true);
  };

  const handleSubmitSpecialization = async () => {
    try {
      const values = await form.validateFields();
      
      const res = await StudentAPI.updateStudentSpecialization(studentId, {
        specializationId: values.specializationId,
      });

      if (res?.data?.success === false) {
        toast.error(res.data.message || "Cập nhật thất bại!");
        return;
      }

      toast.success("Cập nhật thế mạnh thành công!");
      setOpenSpecialization(false);

      const selected = specializations.find(
        (item) => item.id === values.specializationId,
      );

      setData((prev) => ({
        ...prev,
        specializationId: values.specializationId,
        specializationName: selected?.name || "",
      }));
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          "Lỗi hệ thống!",
      );
    }
  };

  return (
    <>
      <Title level={2} className="text-center mb-6">
        🎓 Dashboard Sinh Viên
      </Title>

      <Row gutter={[24, 24]}>
        {/* THÔNG TIN SINH VIÊN */}
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

              <Descriptions.Item label="SĐT">
                {data?.studentPhone || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Email">
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

        {/* HỌC KỲ */}
        <Col xs={24} md={8}>
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
                      data.endDate,
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

        {/* GIẢNG VIÊN */}
        <Col xs={24} md={8}>
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

        {/* THẾ MẠNH ĐĂNG KÝ */}
        <Col xs={24} md={8}>
          <Card
            title={
              <>
                <ReadOutlined /> Thế mạnh đăng ký
              </>
            }
            hoverable
            className="shadow-md rounded-xl"
          >
            <Descriptions column={1} size="middle">
              <Descriptions.Item label="Thế mạnh hiện tại">
                {data?.specializationName || "Chưa đăng ký"}
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái">
                {isAssigned ? (
                  <Tag color="red">Đã khóa sau phân công</Tag>
                ) : (
                  <Tag color="green">Có thể cập nhật</Tag>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Ghi chú">
                Dùng để phân công giảng viên hướng dẫn phù hợp.
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 16 }}>
              <Button
                type="primary"
                block
                disabled={isAssigned}
                onClick={handleOpenSpecialization}
              >
                {!data?.specializationName
                  ? "Đăng ký thế mạnh"
                  : isAssigned
                    ? "Đã khóa"
                    : "Cập nhật thế mạnh"}
              </Button>
            </div>
          </Card>
        </Col>

        {/* TRẠNG THÁI ĐỀ TÀI */}
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

      {/* MODAL ĐĂNG KÝ THẾ MẠNH */}
      <Modal
        open={openSpecialization}
        title="Đăng ký thế mạnh"
        onCancel={() => {
          setOpenSpecialization(false);
          form.resetFields();
        }}
        onOk={handleSubmitSpecialization}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="specializationId"
            label="Chọn thế mạnh của bạn"
            rules={[{ required: true, message: "Vui lòng chọn thế mạnh" }]}
          >
            <Select placeholder="Chọn thế mạnh">
              {specializations.map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Text type="secondary">
            Sau khi được phân công giảng viên, bạn sẽ không thể thay đổi thế
            mạnh.
          </Text>
        </Form>
      </Modal>
    </>
  );
}
