import { useState } from "react";
import { Card, Select, Table, Typography, Tag, Row, Col } from "antd";

const { Title, Text } = Typography;
const { Option } = Select;

export default function StudentList() {
  const terms = [
    { id: 1, name: "HK1-2026" },
    { id: 2, name: "HK2-2026" },
  ];

  const studentsData = [
    {
      id: 1,
      mssv: "SV001",
      name: "Nguyễn Văn A",
      email: "a@gmail.com",
      phone: "0123456789",
      gender: "Nam",
      className: "CNTT1",
      major: "Công nghệ thông tin",
      termId: 1,
    },
    {
      id: 2,
      mssv: "SV002",
      name: "Trần Thị B",
      email: "b@gmail.com",
      phone: "0987654321",
      gender: "Nữ",
      className: "QTKD1",
      major: "Quản trị kinh doanh",
      termId: 1,
    },
    {
      id: 3,
      mssv: "SV003",
      name: "Lê Văn C",
      email: "c@gmail.com",
      phone: "0111222333",
      gender: "Nam",
      className: "CNTT2",
      major: "Công nghệ thông tin",
      termId: 2,
    },
  ];

  const [selectedTerm, setSelectedTerm] = useState(1);

  const filteredStudents = studentsData.filter(
    (student) => student.termId === selectedTerm
  );

  const selectedTermName =
    terms.find((term) => term.id === selectedTerm)?.name || "";

  const columns = [
    {
      title: "MSSV",
      dataIndex: "mssv",
      key: "mssv",
    },
    {
      title: "Họ tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "SĐT",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (gender) =>
        gender === "Nam" ? (
          <Tag color="blue">Nam</Tag>
        ) : (
          <Tag color="pink">Nữ</Tag>
        ),
    },
    {
      title: "Lớp",
      dataIndex: "className",
      key: "className",
    },
    {
      title: "Ngành",
      dataIndex: "major",
      key: "major",
    },
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

          <Text type="secondary">
            Tổng sinh viên: {filteredStudents.length}
          </Text>
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

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredStudents}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        bordered
      />
    </Card>
  );
}
