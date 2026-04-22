import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  message,
  Input,
  Select,
  Row,
  Col,
  Empty,
  Alert,
  Modal,
  Tabs,
} from "antd";
import { MdAssignmentInd } from "react-icons/md";
import { SpecializationAPI } from "../../api/SpecializationAPI";
import { TermAPI } from "../../api/TermAPI";

const { Title, Text } = Typography;
const { Search } = Input;

export default function AssignTeacherPage() {
  const [loading, setLoading] = useState(false);
  const [termLoading, setTermLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [terms, setTerms] = useState([]);
  const [selectedTermId, setSelectedTermId] = useState(null);

  const [teachers, setTeachers] = useState([]);
  const [strengthOptions, setStrengthOptions] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [studentStats, setStudentStats] = useState([]);

  useEffect(() => {
    loadInitData();
  }, []);

  const getArrayData = (response) => {
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    if (Array.isArray(response?.data?.result)) return response.data.result;
    return [];
  };

  const mapTeacherData = (teacherData) => {
    return teacherData.map((item, index) => ({
      id: item.teacherId || item.id || index + 1,
      code: item.teacherCode || item.code || "",
      name: item.fullName || item.teacherName || item.name || "",
      email: item.email || item.userEmail || "",
      role: item.role || "",
      strengths: Array.isArray(item.specializations)
        ? item.specializations.map((s) => ({
            id: s.id,
            name: s.name || s.specializationName || "",
          }))
        : [],
    }));
  };

  const loadInitData = async () => {
    try {
      setTermLoading(true);

      const [termRes, specializationRes] = await Promise.all([
        TermAPI.getAllTermForTeacherLayout(),
        SpecializationAPI.getAllSpecializtion(),
      ]);

      const termData = getArrayData(termRes);
      const specializationData = getArrayData(specializationRes);

      setTerms(termData);

      setStrengthOptions(
        specializationData.map((item) => ({
          label: item.name || item.specializationName || "Không có tên chuyên môn",
          value: item.id,
        }))
      );

      if (termData.length > 0) {
        const defaultTermId = termData[0].id;
        setSelectedTermId(defaultTermId);
        await loadTeacherAssignments(defaultTermId);
        await loadStudentStats();
      }
    } catch (error) {
      message.error("Không tải được dữ liệu ban đầu");
    } finally {
      setTermLoading(false);
    }
  };

  const loadTeacherAssignments = async (termId) => {
    if (!termId) {
      setTeachers([]);
      return;
    }

    try {
      setLoading(true);
      const res = await SpecializationAPI.getTeacherSpecializationTerm(termId);
      const teacherData = getArrayData(res);
      setTeachers(mapTeacherData(teacherData));
    } catch (error) {
      message.error("Không tải được danh sách phân công theo kỳ");
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentStats = async () => {
    try {
      const res = await SpecializationAPI.getStudentStats();
      console.log("🚀 ~ loadStudentStats ~ res:", res)
      setStudentStats(getArrayData(res));
    } catch (error) {
      setStudentStats([]);
    }
  };

  const loadHistory = async () => {
    if (!selectedTermId) {
      message.warning("Vui lòng chọn kỳ thực tập");
      return;
    }

    try {
      setHistoryLoading(true);
      const res = await SpecializationAPI.getTeacherSpecializationHistory(
        selectedTermId
      );
      setHistoryData(getArrayData(res));
      setHistoryOpen(true);
    } catch (error) {
      message.error("Không tải được lịch sử phân công");
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleTermChange = async (value) => {
    setSelectedTermId(value);
    await loadTeacherAssignments(value);
    await loadStudentStats();
  };

  const selectedTerm = useMemo(() => {
    return terms.find((item) => item.id === selectedTermId);
  }, [terms, selectedTermId]);

  const normalizeTermStatus = (status) => {
    return String(status || "").trim().toUpperCase();
  };

  const TERM_STATUS_CONFIG = {
    SAP_DIEN_RA: {
      label: "Sắp diễn ra",
      color: "warning",
      editable: false,
    },
    DANG_DIEN_RA: {
      label: "Đang diễn ra",
      color: "success",
      editable: true,
    },
    KET_THUC: {
      label: "Đã kết thúc",
      color: "default",
      editable: false,
    },
  };

  const getVietnameseTermStatus = (status) => {
    const normalized = normalizeTermStatus(status);
    return TERM_STATUS_CONFIG[normalized]?.label || "Chưa có trạng thái";
  };

  const getTermStatusColor = (status) => {
    const normalized = normalizeTermStatus(status);
    return TERM_STATUS_CONFIG[normalized]?.color || "processing";
  };

  const isEditableTerm = useMemo(() => {
    const normalized = normalizeTermStatus(selectedTerm?.status);
    return TERM_STATUS_CONFIG[normalized]?.editable || false;
  }, [selectedTerm]);

  const totalStudents = useMemo(() => {
    return studentStats.reduce((sum, item) => sum + Number(item.total || 0), 0);
  }, [studentStats]);

  const handleChangeStrengths = (teacherId, values) => {
    if (!isEditableTerm) return;

    setTeachers((prev) =>
      prev.map((item) =>
        item.id === teacherId
          ? {
              ...item,
              strengths: values.map((value) => {
                const found = strengthOptions.find((opt) => opt.value === value);
                return {
                  id: value,
                  name: found?.label || "",
                };
              }),
            }
          : item
      )
    );
  };

  const handleSaveOne = async (record) => {
    if (!selectedTermId) {
      message.warning("Vui lòng chọn kỳ thực tập");
      return;
    }

    if (!isEditableTerm) {
      message.warning("Chỉ được phân công khi kỳ thực tập đang diễn ra");
      return;
    }

    try {
      const payload = {
        teacherId: record.id,
        termId: selectedTermId,
        specializationIds: record.strengths.map((item) => item.id),
      };
      await SpecializationAPI.saveTeacherSpecializationTerm(payload);
      message.success(`Đã lưu phân công cho ${record.name}`);
      await loadTeacherAssignments(selectedTermId);
    } catch (error) {
      message.error("Lưu phân công thất bại");
    }
  };

  const handleSaveAll = async () => {
    if (!selectedTermId) {
      message.warning("Vui lòng chọn kỳ thực tập");
      return;
    }

    if (!isEditableTerm) {
      message.warning("Chỉ được phân công khi kỳ thực tập đang diễn ra");
      return;
    }

    try {
      const payload = teachers.map((item) => ({
        teacherId: item.id,
        termId: selectedTermId,
        specializationIds: item.strengths.map((s) => s.id),
      }));
      await SpecializationAPI.saveTeacherSpecializationTermBulk(payload);
      message.success("Đã lưu toàn bộ phân công");
      await loadTeacherAssignments(selectedTermId);
    } catch (error) {
      message.error("Lưu toàn bộ phân công thất bại");
    }
  };

  const filteredTeachers = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return teachers.filter((item) => {
      const matchKeyword =
        !q ||
        item.name?.toLowerCase().includes(q) ||
        item.code?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q);

      const assigned = item.strengths?.length > 0;

      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "assigned" && assigned) ||
        (filterStatus === "unassigned" && !assigned);

      return matchKeyword && matchStatus;
    });
  }, [teachers, keyword, filterStatus]);

  const columns = [
    {
      title: "Mã giảng viên",
      dataIndex: "code",
      key: "code",
      width: 140,
      render: (value) => value || <Text type="secondary">Chưa có mã</Text>,
    },
    {
      title: "Giảng viên",
      key: "teacher",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.name || "Chưa có tên"}</div>
          <Text type="secondary">{record.email || "Chưa có email"}</Text>
        </div>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 160,
      render: (role) => {
        const normalized = String(role || "").toUpperCase();

        if (normalized === "HEAD_OF_DEPARTMENT") {
          return <Tag color="gold">Trưởng bộ môn</Tag>;
        }

        if (normalized === "TEACHER") {
          return <Tag color="blue">Giảng viên</Tag>;
        }

        return <Tag>{role || "Chưa xác định"}</Tag>;
      },
    },
    {
      title: "Chuyên môn phụ trách",
      key: "strengthsSelect",
      render: (_, record) => (
        <Select
          mode="multiple"
          allowClear
          style={{ width: "100%" }}
          placeholder={
            isEditableTerm
              ? "Chọn chuyên môn phụ trách"
              : "Kỳ này không cho phép chỉnh sửa"
          }
          value={record.strengths.map((s) => s.id)}
          onChange={(values) => handleChangeStrengths(record.id, values)}
          maxTagCount="responsive"
          options={strengthOptions}
          disabled={!isEditableTerm}
        />
      ),
    },
    {
      title: "Đang phụ trách",
      key: "strengthsView",
      width: 300,
      render: (_, record) => (
        <Space wrap>
          {record.strengths?.length > 0 ? (
            record.strengths.map((item) => (
              <Tag color="green" key={item.id}>
                {item.name}
              </Tag>
            ))
          ) : (
            <Text type="secondary">Chưa được phân công</Text>
          )}
        </Space>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 140,
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => handleSaveOne(record)}
          disabled={!isEditableTerm}
        >
          Lưu
        </Button>
      ),
    },
  ];

  const historyColumns = [
    {
      title: "Giảng viên",
      key: "teacher",
      width: 220,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>
            {record.teacherName || "Chưa có tên"}
          </div>
          <Text type="secondary">{record.teacherCode || "Chưa có mã"}</Text>
        </div>
      ),
    },
    {
      title: "Trước khi sửa",
      dataIndex: "oldValue",
      key: "oldValue",
      width: 260,
      render: (value) => value || <Text type="secondary">Trống</Text>,
    },
    {
      title: "Sau khi sửa",
      dataIndex: "newValue",
      key: "newValue",
      width: 260,
      render: (value) => value || <Text type="secondary">Trống</Text>,
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      width: 220,
      render: (value) => value || <Text type="secondary">Không có</Text>,
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
    },
  ];

  const overviewTab = (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Title level={5} style={{ marginBottom: 8 }}>
              Tổng số sinh viên
            </Title>
            <Title level={2} style={{ margin: 0 }}>
              {totalStudents}
            </Title>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card>
            <Title level={5} style={{ marginBottom: 8 }}>
              Số nhóm chuyên môn
            </Title>
            <Title level={2} style={{ margin: 0 }}>
              {studentStats.length}
            </Title>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card>
            <Title level={5} style={{ marginBottom: 8 }}>
              Kỳ đang xem
            </Title>
            <Text>{selectedTerm?.name || "Chưa chọn kỳ"}</Text>
          </Card>
        </Col>
      </Row>

      <Card
        title="Tổng quan thế mạnh sinh viên"
        style={{ marginTop: 16 }}
        bordered
      >
        {studentStats.length === 0 ? (
          <Empty description="Chưa có dữ liệu thế mạnh sinh viên" />
        ) : (
          <Space wrap size={[8, 12]}>
            {studentStats.map((item, index) => (
              <Tag color="blue" key={index} style={{ padding: "6px 10px" }}>
                {item.name}: {item.total} sinh viên
              </Tag>
            ))}
          </Space>
        )}
      </Card>

      <Card title="Gợi ý phân công" style={{ marginTop: 16 }} bordered>
        {studentStats.length === 0 ? (
          <Text type="secondary">Chưa có dữ liệu để gợi ý phân công</Text>
        ) : (
          <Space direction="vertical" size={10} style={{ width: "100%" }}>
            <Text type="secondary">
              Trưởng bộ môn nên xem tổng quan thế mạnh sinh viên trước khi phân
              công giảng viên phụ trách. Nhóm “Chưa chọn chuyên môn” là các sinh
              viên chưa xác định thế mạnh, nên cần được cân nhắc khi phân bổ
              giảng viên hỗ trợ.
            </Text>

            {studentStats.map((item, index) => (
              <div key={index}>
                <Text>
                  {item.name}: <b>{item.total}</b> sinh viên
                </Text>
              </div>
            ))}
          </Space>
        )}
      </Card>
    </div>
  );

  const assignTab = (
    <div>
      {selectedTerm && !isEditableTerm && (
        <div style={{ marginBottom: 16 }}>
          <Alert
            type="warning"
            showIcon
            message="Không thể chỉnh sửa phân công"
            description={`Kỳ thực tập hiện ở trạng thái "${getVietnameseTermStatus(
              selectedTerm.status
            )}", nên hệ thống không cho phép lưu hoặc thay đổi phân công giảng viên.`}
          />
        </div>
      )}

      <div
        style={{
          marginBottom: 16,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ width: 420, maxWidth: "100%" }}>
          <Search
            placeholder="Tìm theo mã giảng viên, tên hoặc email..."
            allowClear
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <Select
          value={filterStatus}
          onChange={setFilterStatus}
          style={{ width: 220 }}
          options={[
            { label: "Tất cả", value: "all" },
            { label: "Đã được phân công", value: "assigned" },
            { label: "Chưa được phân công", value: "unassigned" },
          ]}
        />
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredTeachers}
        loading={loading}
        pagination={{ pageSize: 6 }}
        scroll={{ x: 1200 }}
        locale={{
          emptyText: "Không có dữ liệu giảng viên",
        }}
      />
    </div>
  );

  return (
    <div style={{ padding: 16 }}>
      <Card bordered={false}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <MdAssignmentInd size={28} />
            <div>
              <Title level={3} style={{ margin: 0 }}>
                Phân công giảng viên theo kỳ thực tập
              </Title>
              <Text type="secondary">
                Trưởng bộ môn phân công chuyên môn phụ trách cho giảng viên theo
                từng kỳ thực tập
              </Text>
            </div>
          </div>

          <Space>
            <Button onClick={loadHistory} disabled={!selectedTermId}>
              Xem lịch sử
            </Button>
            <Button
              type="primary"
              onClick={handleSaveAll}
              disabled={!isEditableTerm || !selectedTermId}
            >
              Lưu toàn bộ
            </Button>
          </Space>
        </div>

        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={10} lg={8}>
            <Text style={{ display: "block", marginBottom: 6 }}>
              Kỳ thực tập
            </Text>
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn kỳ thực tập"
              value={selectedTermId}
              onChange={handleTermChange}
              loading={termLoading}
              options={terms.map((term) => ({
                label: `${term.name || "Kỳ thực tập"}${
                  term.academicYear ? ` - ${term.academicYear}` : ""
                }`,
                value: term.id,
              }))}
            />
          </Col>

          <Col xs={24} md={14} lg={16}>
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "end",
              }}
            >
              <Card
                size="small"
                style={{ width: "100%", background: "#fafafa" }}
                styles={{ body: { padding: 12 } }}
              >
                {selectedTerm ? (
                  <Space wrap>
                    <Tag color="purple">
                      {selectedTerm.name || "Chưa có tên kỳ"}
                    </Tag>
                    <Tag>
                      {selectedTerm.academicYear || "Chưa có năm học"}
                    </Tag>
                    <Tag color={getTermStatusColor(selectedTerm.status)}>
                      {getVietnameseTermStatus(selectedTerm.status)}
                    </Tag>
                  </Space>
                ) : (
                  <Text type="secondary">Chưa chọn kỳ thực tập</Text>
                )}
              </Card>
            </div>
          </Col>
        </Row>

        {!selectedTermId ? (
          <Empty description="Vui lòng chọn kỳ thực tập" />
        ) : (
          <Tabs
            defaultActiveKey="overview"
            items={[
              {
                key: "overview",
                label: "Tổng quan sinh viên",
                children: overviewTab,
              },
              {
                key: "assign",
                label: "Phân công giảng viên",
                children: assignTab,
              },
            ]}
          />
        )}

        <Modal
          title="Lịch sử phân công chuyên môn"
          open={historyOpen}
          onCancel={() => setHistoryOpen(false)}
          footer={null}
          width={1100}
        >
          <Table
            rowKey="id"
            columns={historyColumns}
            dataSource={historyData}
            loading={historyLoading}
            pagination={{ pageSize: 5 }}
            scroll={{ x: 1000 }}
            locale={{
              emptyText: "Chưa có lịch sử thay đổi",
            }}
          />
        </Modal>
      </Card>
    </div>
  );
}