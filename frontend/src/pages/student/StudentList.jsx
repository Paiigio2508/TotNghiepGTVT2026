import { useState, useEffect } from "react";
import { Card, Select, Table, Typography, Tag, Row, Col, Image } from "antd";
import { AssignmentsAPI } from "../../api/AssignmentsAPI";

const { Title, Text } = Typography;
const { Option } = Select;

export default function StudentList() {
  const [terms, setTerms] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [teacherId, setTeacherId] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("userData");

    if (userData) {
      const parsed = JSON.parse(userData);
      setTeacherId(parsed.userId);
      console.log("Loaded teacherId:", parsed.userId);
    }
  }, []);

  // ✅ Load danh sách học kỳ (tạm hardcode)
  useEffect(() => {
    setTerms([
      { id: "6fcc33f1-ab9a-4d18-ad40-fac8603beb9c", name: "HK1-2026" },
      { id: "a4d9d5b6-6b71-40bc-8f40-0c19ee339360", name: "HK2-2026" },
    ]);
    setSelectedTerm("6fcc33f1-ab9a-4d18-ad40-fac8603beb9c");
  }, []);

  // ✅ Load sinh viên khi có teacherId và selectedTerm
  useEffect(() => {
    if (!selectedTerm || !teacherId) return;

    const fetchStudents = async () => {
      try {
        console.log("Calling API with:", teacherId, selectedTerm);

        const res = await AssignmentsAPI.getStudentsByTerm(
          teacherId,
          selectedTerm,
        );

        setStudents(res.data);
      } catch (err) {
        console.error("Lỗi load sinh viên:", err);
      }
    };

    fetchStudents();
  }, [selectedTerm, teacherId]);

  const selectedTermName =
    terms.find((term) => term.id === selectedTerm)?.name || "";

  const columns = [
    { title: "MSSV", dataIndex: "studentCode" },
    {
      title: "Ảnh",
      dataIndex: "urlImage",
      render: (urlImage) => (
        <Image
          src={urlImage}
          width={80}
          height={80}
          style={{ objectFit: "cover", borderRadius: "50%" }}
          fallback="https://via.placeholder.com/60"
        />
      ),
    },
    { title: "Họ tên", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "SĐT", dataIndex: "phone" },
    {
      title: "Giới tính",
      dataIndex: "gender",
      render: (gender) =>
        gender === "Nam" ? (
          <Tag color="blue">Nam</Tag>
        ) : (
          <Tag color="pink">Nữ</Tag>
        ),
    },
    { title: "Lớp", dataIndex: "className" },
    { title: "Ngành", dataIndex: "major" },
  ];

  return (
    <Card>
      <Row justify="space-between" align="middle" className="mb-3">
        <Col>
          <Title level={3}>
            Danh sách sinh viên{" "}
            {selectedTermName && (
              <Tag color="green" className="ms-2 fs-4">
                {selectedTermName}
              </Tag>
            )}
          </Title>

          <Text type="secondary">Tổng sinh viên: {students.length}</Text>
        </Col>

        <Col>
          <Select
            value={selectedTerm}
            style={{ width: 220 }}
            onChange={(value) => setSelectedTerm(value)}
          >
            {terms.map((term) => (
              <Option key={term.id} value={term.id}>
                {term.name}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={students}
        rowKey="id"
        pagination={{ pageSize: 7 }}
        bordered
      />
    </Card>
  );
}
