import { useState, useEffect } from "react";
import {
  Card,
  Select,
  Table,
  Typography,
  Tag,
  Row,
  Col,
  Image,
  message,
  Input,
  Button,
  Form,
  Space,
} from "antd";
import { RetweetOutlined } from "@ant-design/icons";
import { AssignmentsAPI } from "../../api/AssignmentsAPI";
import { TermAPI } from "../../api/TermAPI";

const { Title, Text } = Typography;
const { Option } = Select;

export default function StudentList() {
  const [terms, setTerms] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentsGoc, setStudentsGoc] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [teacherId, setTeacherId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  /* ================= LẤY TEACHER ================= */
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsed = JSON.parse(userData);
      setTeacherId(parsed.userId);
    }
  }, []);

  /* ================= LOAD TERM ================= */
  const loadInternShipTerm = async () => {
    try {
      const res = await TermAPI.getAllTermForTeacherLayout();
      setTerms(res.data);
      if (res.data.length > 0) {
        setSelectedTerm(res.data[0].id);
      }
    } catch {
      message.error("Tải danh sách học kỳ thất bại!");
    }
  };

  useEffect(() => {
    loadInternShipTerm();
  }, []);
  /* ================= LOAD STUDENTS ================= */
  useEffect(() => {
    if (!selectedTerm || !teacherId) return;
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await AssignmentsAPI.getStudentsByTerm(
          teacherId,
          selectedTerm
        );
        setStudents(res.data);
        setStudentsGoc(res.data);
      } catch {
        message.error("Tải danh sách sinh viên thất bại!");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedTerm, teacherId]);

  /* ================= SEARCH ================= */
  const handleSearch = (keyword) => {
    if (!keyword || keyword.trim() === "") {
      setStudents(studentsGoc);
      return;
    }

    const result = studentsGoc.filter(
      (item) =>
        item.studentCode?.toLowerCase().includes(keyword.toLowerCase()) ||
        item.name?.toLowerCase().includes(keyword.toLowerCase()) ||
        item.phone?.toLowerCase().includes(keyword.toLowerCase()) ||
        item.email?.toLowerCase().includes(keyword.toLowerCase())
    );

    setStudents(result);
  };

  const selectedTermName =
    terms.find((term) => term.id === selectedTerm)?.name || "";

  /* ================= COLUMNS ================= */
  const columns = [
    { title: "MSSV", dataIndex: "studentCode" },
    {
      title: "Ảnh",
      dataIndex: "urlImage",
      render: (urlImage) => (
        <Image
          src={urlImage}
          width={50}
          height={50}
          style={{ objectFit: "cover", borderRadius: "50%" }}
          fallback="https://via.placeholder.com/70"
        />
      ),
    },
    { title: "Họ tên", dataIndex: "name" },
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
    { title: "Email", dataIndex: "email" },
    { title: "SĐT", dataIndex: "phone" },
    { title: "Lớp", dataIndex: "className" },
    { title: "Ngành", dataIndex: "major" },
  ];

  return (
    <Card>
      <Row align="middle" className="mb-3">
        {/* Cột trái */}
        <Col span={6}></Col>

        {/* Cột giữa - TITLE */}
        <Col span={12} className="text-center">
          <Title level={3}>
            Danh sách sinh viên{" "}
            {selectedTermName && (
              <Tag color="green" className="fs-4">
                {selectedTermName}
              </Tag>
            )}
          </Title>

          <Text type="secondary">Tổng sinh viên: {students.length}</Text>
        </Col>

        {/* Cột phải - SELECT */}
        <Col span={6} className="text-end">
          <Select
            value={selectedTerm}
            style={{ width: 200 }}
            onChange={(value) => {
              setSelectedTerm(value);
              form.resetFields();
            }}
          >
            {terms.map((term) => (
              <Option key={term.id} value={term.id}>
                {term.name}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      {/* SEARCH */}
      <Form
        form={form}
        onValuesChange={(changedValues) => handleSearch(changedValues.timKiem)}
      >
        <Row gutter={16} className="mb-3">
          <Col span={8}>
            <Form.Item name="timKiem">
              <Input placeholder="Tìm MSSV / Tên / Email / SĐT..." allowClear />
            </Form.Item>
          </Col>

          <Col>
            <Space>
              <Button
                icon={<RetweetOutlined />}
                onClick={() => {
                  form.resetFields();
                  setStudents(studentsGoc);
                }}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>

      <Table
        columns={columns}
        dataSource={students}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 7 }}
        bordered
      />
    </Card>
  );
}
