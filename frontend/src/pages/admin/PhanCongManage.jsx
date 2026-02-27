import { Divider, Row, Col, Card, Table, Button } from "antd";
import { useLocation, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { LuNotebookPen } from "react-icons/lu";
import { AssignmentsAPI } from "../../api/AssignmentsAPI";
import { ExportAssignedExcel } from "../../utils/ExportAssignedExcel";
export default function PhanCongManage() {
  const { termId } = useParams();
  const location = useLocation();
  const term = location.state?.term;
  const [studentData, setStudentData] = useState([]);
  const [teacherData, setTeacherData] = useState([]);
  const [assignedData, setAssignedData] = useState([]);
  useEffect(() => {
    loadStudents();
    loadGV();
    loadAssigned();
  }, []);

  const loadStudents = async () => {
    try {
      const res = await AssignmentsAPI.getAllsvDuDK(termId);
      setStudentData(res.data);
    } catch (err) {
      message.error("Tải danh sách giảng viên thất bại!");
    }
  };
  const loadGV = async () => {
    try {
      const res = await AssignmentsAPI.getAllGV(termId);
      setTeacherData(res.data);
    } catch (err) {
      message.error("Tải danh sách giảng viên thất bại!");
    }
  };
  const loadAssigned = async () => {
    try {
      const res = await AssignmentsAPI.getAllsvAssigned(termId);
      setAssignedData(res.data);
    } catch (err) {
      message.error("Tải danh sách đã phân công thất bại!");
    }
  };
  // ===== CỘT BẢNG SINH VIÊN =====
  const studentColumns = [
    { title: "Mã SV", dataIndex: "studentCode" },
    { title: "Họ tên", dataIndex: "fullName" },
    { title: "Lớp", dataIndex: "className" },
  ];

  // ===== CỘT BẢNG GIẢNG VIÊN =====
  const teacherColumns = [
    { title: "Giảng viên", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Đã nhận", dataIndex: "assignedCount" },
  ];
  const assignedColumns = [
    {
      title: "STT",
      width: 70,
      align: "center",
      render: (text, record, index) => index + 1,
    },
    { title: "Mã SV", dataIndex: "studentCode" },
    { title: "Họ tên", dataIndex: "fullName" },
    {
      title: "Lớp",
      dataIndex: "className",
      filters: [...new Set(assignedData.map((item) => item.className))].map(
        (cls) => ({ text: cls, value: cls })
      ),
      onFilter: (value, record) => record.className === value,
    },
    {
      title: "Giảng viên HD",
      dataIndex: "teacherName",
      filters: [...new Set(assignedData.map((item) => item.teacherName))].map(
        (name) => ({ text: name, value: name })
      ),
      onFilter: (value, record) => record.teacherName === value,
    },
  ];
  return (
    <>

      <Row align="middle" style={{ marginBottom: 16 }}>
        <Col flex="auto" style={{ textAlign: "center" }}>
          <h2 className="fw-bold" style={{ margin: 0 }}>
            <LuNotebookPen />{" "}
            {term
              ? `${term.name} (${term.academicYear})`
              : "Phân công giảng viên"}
          </h2>
        </Col>

        <Col style={{ position: "absolute", right: 24 }}>
          <Button
            type="primary"
            size="large"
            onClick={async () => {
              try {
                await AssignmentsAPI.autoAssign(termId);
                alert("Phân công tự động thành công");

                await loadStudents();
                await loadGV();
                await loadAssigned();
              } catch (error) {
                alert(error.response?.data || "Có lỗi xảy ra");
              }
            }}
          >
            Phân công tự động
          </Button>
        </Col>
      </Row>

      <Row gutter={16} >
        {/* ===== BẢNG SINH VIÊN ===== */}
        <Col span={12}>
          <Card title="Sinh viên chưa phân công">
            <Table
              columns={studentColumns}
              dataSource={studentData}
              rowKey="id"
              pagination={{
                showQuickJumper: true,
                defaultPageSize: 5,
              }}
            />
          </Card>
        </Col>

        {/* ===== BẢNG GIẢNG VIÊN (RADIO CHỌN 1) ===== */}
        <Col span={12}>
          <Card title="Giảng viên">
            <Table
              columns={teacherColumns}
              dataSource={teacherData}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
      <Row  className="mt-5">
        <Col span={24}>
          <Card
            title="Danh sách sinh viên đã phân công"
            extra={
              <Button
                type="primary"
                onClick={() => ExportAssignedExcel(assignedData, term)}
              >
                Xuất Excel
              </Button>
            }
          >
            <Table
              columns={assignedColumns}
              dataSource={assignedData}
              rowKey={(record, index) => index}
              pagination={{
                showQuickJumper: true,
                defaultPageSize: 5,
              }}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}
