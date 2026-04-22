import { Card, Button, Row, Col, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { MdAssignmentInd } from "react-icons/md";

const { Title, Text } = Typography;

export default function TeacherDashboard() {
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const role = userData?.role;

  const isHeadOfDepartment = role === "HEAD_OF_DEPARTMENT";

  return (
    <div style={{ padding: 16 }}>
      <Title level={3}>Tổng quan</Title>

      <Row gutter={[16, 16]}>
        {isHeadOfDepartment && (
          <Col xs={24} md={12} lg={8}>
            <Card
              hoverable
              onClick={() => navigate("/teacher/assign-teachers")}
              style={{ borderRadius: 12 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <MdAssignmentInd size={28} />
                <div>
                  <Title level={5} style={{ margin: 0 }}>
                    Phân công giảng viên
                  </Title>
                  <Text type="secondary">
                    Phân công chuyên môn phụ trách theo kỳ thực tập
                  </Text>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <Button type="primary">
                  Vào trang phân công
                </Button>
              </div>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
}