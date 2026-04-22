import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Tag,
  Modal,
  Select,
  Space,
  Typography,
  message,
  Collapse,
  Divider,
  Alert,
  Popconfirm,
} from "antd";
import { useLocation, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { LuNotebookPen } from "react-icons/lu";
import { AssignmentsAPI } from "../../api/AssignmentsAPI";
import { ExportAssignedExcel } from "../../utils/ExportAssignedExcel";

const { Text } = Typography;
const { Option } = Select;

export default function PhanCongManage() {
  const { termId } = useParams();
  const location = useLocation();
  const term = location.state?.term;

  const [studentData, setStudentData] = useState([]);
  const [teacherData, setTeacherData] = useState([]);
  const [assignedData, setAssignedData] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [suggestTeachers, setSuggestTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [assigningAuto, setAssigningAuto] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await Promise.all([loadStudents(), loadGV(), loadAssigned()]);
  };

  const loadStudents = async () => {
    try {
      const res = await AssignmentsAPI.getAllsvDuDK(termId);
      setStudentData(res.data || []);
    } catch (err) {
      message.error("Tải danh sách sinh viên chưa phân công thất bại!");
    }
  };

  const loadGV = async () => {
    try {
      const res = await AssignmentsAPI.getAllGV(termId);
      setTeacherData(res.data || []);
    } catch (err) {
      message.error("Tải danh sách giảng viên thất bại!");
    }
  };

  const loadAssigned = async () => {
    try {
      const res = await AssignmentsAPI.getAllsvAssigned(termId);
      console.log("🚀 ~ loadAssigned ~ res:", res)
      setAssignedData(res.data || []);
    } catch (err) {
      message.error("Tải danh sách đã phân công thất bại!");
    }
  };

  const normalizeSpecializations = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);

    return String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const getAssignmentTypeLabel = (value) => {
    switch (value) {
      case "AUTO":
        return <Tag color="blue">Tự động</Tag>;
      case "MANUAL":
        return <Tag color="gold">Thủ công</Tag>;
      default:
        return <Tag>Không rõ</Tag>;
    }
  };

  const getReasonLabel = (value) => {
    switch (value) {
      case "MATCHED_SPECIALIZATION":
        return "Đúng thế mạnh";
      case "NO_SPECIALIZATION_RANDOM":
        return "Sinh viên không đăng ký thế mạnh, hệ thống phân theo tải hiện tại";
      case "NO_MATCHING_TEACHER":
        return "Không còn giảng viên đúng thế mạnh, hệ thống phân tạm theo tải hiện tại";
      case "REASSIGNED_BY_HEAD":
        return "Trưởng bộ môn điều chỉnh lại phân công";
      case "TEACHER_OVERLOAD_BALANCE":
        return "Cân bằng số lượng sinh viên giữa các giảng viên";
      default:
        return value || "Không có thông tin";
    }
  };

  const getFitTag = (record) => {
    const spec = record?.matchedSpecialization || record?.studentSpecialization;

    if (!spec || String(spec).trim() === "") {
      return <Tag>Chưa đăng ký</Tag>;
    }

    if (record?.isMatchedSpecialization === "true") {
      return <Tag color="green">Đúng thế mạnh</Tag>;
    }

    if (record?.isMatchedSpecialization === "false") {
      return <Tag color="red">Không đúng thế mạnh</Tag>;
    }

    return <Tag color="default">Chưa xác định</Tag>;
  };

  const sortTeachersForManualAdjust = (teachers, studentSpecValue) => {
    const studentSpecs = normalizeSpecializations(studentSpecValue).map((x) =>
      x.toLowerCase(),
    );

    return [...teachers].sort((a, b) => {
      const aSpecs = normalizeSpecializations(
        a.specializations || a.teacherSpecializations,
      ).map((x) => x.toLowerCase());
      const bSpecs = normalizeSpecializations(
        b.specializations || b.teacherSpecializations,
      ).map((x) => x.toLowerCase());

      const aMatched =
        studentSpecs.length > 0 &&
        aSpecs.some((spec) => studentSpecs.includes(spec));
      const bMatched =
        studentSpecs.length > 0 &&
        bSpecs.some((spec) => studentSpecs.includes(spec));

      if (aMatched !== bMatched) return aMatched ? -1 : 1;

      const aCount = Number(a.assignedCount || 0);
      const bCount = Number(b.assignedCount || 0);
      if (aCount !== bCount) return aCount - bCount;

      return String(a.name || "").localeCompare(String(b.name || ""));
    });
  };

  const handleAutoAssign = async () => {
    try {
      setAssigningAuto(true);
      await AssignmentsAPI.autoAssign(termId);
      message.success("Phân công tự động thành công");
      await loadAll();
    } catch (error) {
      message.error(error?.response?.data || "Có lỗi xảy ra");
    } finally {
      setAssigningAuto(false);
    }
  };

  const openUpdateTeacherModal = async (record) => {
    setSelectedAssignment(record);
    setSelectedTeacherId(record.teacherId || null);

    try {
      let teacherList = [];

      if (AssignmentsAPI.getSuggestedTeachers) {
        const res = await AssignmentsAPI.getSuggestedTeachers(
          record.studentId,
          termId,
        );
        teacherList = res.data || [];
      } else {
        teacherList = teacherData || [];
      }

      const sorted = sortTeachersForManualAdjust(
        teacherList,
        record.matchedSpecialization || record.studentSpecialization,
      );

      setSuggestTeachers(sorted);
      setOpenModal(true);
    } catch (error) {
      const sorted = sortTeachersForManualAdjust(
        teacherData || [],
        record.matchedSpecialization || record.studentSpecialization,
      );
      setSuggestTeachers(sorted);
      setOpenModal(true);
      message.warning(
        "Không tải được danh sách gợi ý từ hệ thống, đang dùng danh sách giảng viên hiện có.",
      );
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAssignment(null);
    setSuggestTeachers([]);
    setSelectedTeacherId(null);
  };

const handleUpdateTeacher = async () => {
  if (!selectedAssignment) {
    message.error("Không tìm thấy bản ghi cần cập nhật");
    return;
  }

  if (!selectedTeacherId) {
    message.warning("Vui lòng chọn giảng viên");
    return;
  }

  try {
    setSubmittingUpdate(true);

    await AssignmentsAPI.changeTeacher(
      selectedAssignment.assignmentId || selectedAssignment.id,
      {
        teacherId: selectedTeacherId,
        reason: "REASSIGNED_BY_HEAD",
      },
    );

    message.success("Cập nhật giảng viên thành công");
    handleCloseModal();
    await loadAll();
  } catch (error) {
    message.error(
      error?.response?.data || error?.message || "Cập nhật giảng viên thất bại",
    );
  } finally {
    setSubmittingUpdate(false);
  }
};

  const studentColumns = [
    { title: "Mã SV", dataIndex: "studentCode" },
    { title: "Họ tên", dataIndex: "fullName" },
    { title: "Lớp", dataIndex: "className" },
  ];

  const teacherColumns = [
    { title: "Giảng viên", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    {
      title: "Đã nhận",
      dataIndex: "assignedCount",
      align: "center",
      render: (value) => value ?? 0,
    },
    {
      title: "Thế mạnh",
      dataIndex: "specializations",
      render: (value) => {
        const specs = normalizeSpecializations(value);
        if (specs.length === 0)
          return <Text type="secondary">Chưa cập nhật</Text>;
        return (
          <Space wrap>
            {specs.map((item, idx) => (
              <Tag key={idx} color="processing">
                {item}
              </Tag>
            ))}
          </Space>
        );
      },
    },
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
    { title: "Ngày sinh", dataIndex: "ngaySinh" },
    {
      title: "Lớp",
      dataIndex: "className",
      filters: [
        ...new Set(assignedData.map((item) => item.className).filter(Boolean)),
      ].map((cls) => ({ text: cls, value: cls })),
      onFilter: (value, record) => record.className === value,
    },
    {
      title: "Giảng viên HD",
      dataIndex: "teacherName",
      filters: [
        ...new Set(
          assignedData.map((item) => item.teacherName).filter(Boolean),
        ),
      ].map((name) => ({ text: name, value: name })),
      onFilter: (value, record) => record.teacherName === value,
    },
    {
      title: "Thế mạnh SV",
      dataIndex: "matchedSpecialization",
      render: (value, record) =>
        value ||
        record.studentSpecialization || (
          <Text type="secondary">Chưa đăng ký</Text>
        ),
    },
    {
      title: "Mức độ phù hợp",
      render: (_, record) => getFitTag(record),
    },
    {
      title: "Nguồn phân công",
      dataIndex: "assignmentType",
      render: (value) => getAssignmentTypeLabel(value),
    },
    {
      title: "Lý do hệ thống phân",
      dataIndex: "assignmentReason",
      render: (value) => getReasonLabel(value),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Button type="link" onClick={() => openUpdateTeacherModal(record)}>
          Cập nhật GV
        </Button>
      ),
    },
  ];

  const selectedTeacher = suggestTeachers.find(
    (item) => String(item.id) === String(selectedTeacherId),
  );

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
          <Popconfirm
            title="Xác nhận phân công"
            description="Hệ thống sẽ tự động phân công giảng viên cho các sinh viên chưa được phân công. Bạn có chắc chắn muốn tiếp tục?"
            okText="Phân công"
            cancelText="Hủy"
            onConfirm={handleAutoAssign}
          >
            <Button type="primary" size="large" loading={assigningAuto}>
              Phân công
            </Button>
          </Popconfirm>
        </Col>
      </Row>

      <Collapse
        style={{ marginBottom: 16 }}
        items={[
          {
            key: "assignment-flow",
            label: <b>Xem luồng phân công</b>,
            children: (
              <div>
                <div>
                  <b>Rule phân công tự động:</b>
                </div>
                <div>1. Ưu tiên đúng thế mạnh.</div>
                <div>
                  2. Trong nhóm đúng thế mạnh, chọn giảng viên đang có ít sinh
                  viên nhất.
                </div>
                <div>
                  3. Nếu sinh viên không đăng ký thế mạnh: phân vào giảng viên
                  có ít sinh viên nhất toàn bộ.
                </div>
                <div>
                  4. Nếu không còn giảng viên đúng thế mạnh: phân tạm sang người
                  ít tải nhất và đánh dấu không đúng thế mạnh.
                </div>

                <Divider style={{ margin: "10px 0" }} />

                <div>
                  <b>Rule hiệu chỉnh thủ công:</b>
                </div>
                <div>- Đổi giảng viên hướng dẫn.</div>
                <div>- Xem lý do hệ thống phân.</div>
                <div>- Xem số lượng sinh viên hiện tại của mỗi giảng viên.</div>
                <div>- Ưu tiên giảng viên đúng thế mạnh khi chọn lại.</div>
              </div>
            ),
          },
        ]}
      />

      <Row gutter={16}>
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

      <Row className="mt-5">
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
              rowKey={(record, index) =>
                record.assignmentId || record.id || index
              }
              pagination={{
                showQuickJumper: true,
                defaultPageSize: 5,
              }}
              scroll={{ x: 1600 }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Hiệu chỉnh phân công giảng viên"
        open={openModal}
        onCancel={handleCloseModal}
        onOk={handleUpdateTeacher}
        okText="Lưu cập nhật"
        cancelText="Đóng"
        confirmLoading={submittingUpdate}
        width={800}
      >
        {selectedAssignment && (
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Card size="small">
              <Row gutter={16}>
                <Col span={12}>
                  <div>
                    <b>Sinh viên:</b> {selectedAssignment.fullName}
                  </div>
                  <div>
                    <b>Mã SV:</b> {selectedAssignment.studentCode}
                  </div>
                  <div>
                    <b>Lớp:</b> {selectedAssignment.className}
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <b>Thế mạnh SV:</b>{" "}
                    {selectedAssignment.matchedSpecialization ||
                      selectedAssignment.studentSpecialization ||
                      "Chưa đăng ký"}
                  </div>
                  <div>
                    <b>GV hiện tại:</b>{" "}
                    {selectedAssignment.teacherName || "Chưa có"}
                  </div>
                  <div>
                    <b>Lý do hệ thống phân:</b>{" "}
                    {getReasonLabel(selectedAssignment.assignmentReason)}
                  </div>
                </Col>
              </Row>
            </Card>

            <Card
              size="small"
              title="Chọn giảng viên mới"
              extra={
                <Text type="secondary">
                  Danh sách đã ưu tiên đúng thế mạnh trước, sau đó đến ít tải
                  hơn
                </Text>
              }
            >
              <Select
                style={{ width: "100%" }}
                placeholder="Chọn giảng viên"
                value={selectedTeacherId}
                onChange={setSelectedTeacherId}
                optionFilterProp="label"
                showSearch
              >
                {suggestTeachers.map((teacher) => {
                  const studentSpecs = normalizeSpecializations(
                    selectedAssignment.matchedSpecialization ||
                      selectedAssignment.studentSpecialization,
                  ).map((x) => x.toLowerCase());

                  const teacherSpecs = normalizeSpecializations(
                    teacher.specializations || teacher.teacherSpecializations,
                  );
                  const matched =
                    studentSpecs.length > 0 &&
                    teacherSpecs.some((x) =>
                      studentSpecs.includes(String(x).toLowerCase()),
                    );

                  return (
                    <Option
                      key={teacher.id}
                      value={teacher.id}
                      label={`${teacher.name} - ${teacher.email || ""}`}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <div>
                            <b>{teacher.name}</b>
                          </div>
                          <div>{teacher.email}</div>
                          <div>
                            {teacherSpecs.length > 0 ? (
                              <Space wrap>
                                {teacherSpecs.map((spec, idx) => (
                                  <Tag
                                    key={idx}
                                    color={matched ? "green" : "default"}
                                  >
                                    {spec}
                                  </Tag>
                                ))}
                              </Space>
                            ) : (
                              <Text type="secondary">
                                Chưa cập nhật thế mạnh
                              </Text>
                            )}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div>
                            <Tag color={matched ? "green" : "default"}>
                              {matched ? "Đúng thế mạnh" : "Khác thế mạnh"}
                            </Tag>
                          </div>
                          <div>
                            <Text>
                              Số SV hiện tại: {teacher.assignedCount ?? 0}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </Option>
                  );
                })}
              </Select>

              {selectedTeacher && (
                <div style={{ marginTop: 16 }}>
                  <Alert
                    type="success"
                    showIcon
                    message={`Giảng viên được chọn: ${selectedTeacher.name}`}
                    description={
                      <div>
                        <div>Email: {selectedTeacher.email || "Không có"}</div>
                        <div>
                          Số sinh viên hiện tại:{" "}
                          {selectedTeacher.assignedCount ?? 0}
                        </div>
                        <div>
                          Thế mạnh:{" "}
                          {normalizeSpecializations(
                            selectedTeacher.specializations ||
                              selectedTeacher.teacherSpecializations,
                          ).join(", ") || "Chưa cập nhật"}
                        </div>
                      </div>
                    }
                  />
                </div>
              )}
            </Card>
          </Space>
        )}
      </Modal>
    </>
  );
}
