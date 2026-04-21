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
} from "antd";
import { MdAssignmentInd } from "react-icons/md";
import { SpecializationAPI } from "../../api/SpecializationAPI";
import { TermAPI } from "../../api/TermAPI";

const { Title, Text } = Typography;
const { Search } = Input;

export default function AssignTeacherPage() {
  const [loading, setLoading] = useState(false);
  const [termLoading, setTermLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [terms, setTerms] = useState([]);
  const [selectedTermId, setSelectedTermId] = useState(null);

  const [teachers, setTeachers] = useState([]);
  const [strengthOptions, setStrengthOptions] = useState([]);

  useEffect(() => {
    loadInitData();
  }, []);

  const loadInitData = async () => {
    try {
      setTermLoading(true);

      const [termRes, specializationRes] = await Promise.all([
        TermAPI.getAllTermForTeacherLayout(),
        SpecializationAPI.getAllSpecializtion(),
      ]);

      const termData = Array.isArray(termRes?.data) ? termRes.data : [];
      const specializationData = Array.isArray(specializationRes?.data)
        ? specializationRes.data
        : [];

      setTerms(termData);

      setStrengthOptions(
        specializationData.map((item) => ({
          label: item.name || item.specializationName || "Không có tên chuyên môn",
          value: item.id,
        }))
      );

      if (termData.length > 0) {
        setSelectedTermId(termData[0].id);
        await loadTeacherAssignments(termData[0].id);
      }
    } catch (error) {
      console.error(error);
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
      const teacherData = Array.isArray(res?.data) ? res.data : [];

      setTeachers(
        teacherData.map((item, index) => ({
          id: item.teacherId || item.id || index + 1,
          code: item.teacherCode || item.code || "",
          name: item.fullName || item.name || "",
          email: item.email || item.userEmail || "",
          role: item.role || "",
          strengths: Array.isArray(item.specializations)
            ? item.specializations.map((s) => ({
                id: s.id,
                name: s.name,
              }))
            : [],
        }))
      );
    } catch (error) {
      console.error(error);
      message.error("Không tải được danh sách phân công theo kỳ");
    } finally {
      setLoading(false);
    }
  };

  const handleTermChange = async (value) => {
    setSelectedTermId(value);
    await loadTeacherAssignments(value);
  };

  const selectedTerm = useMemo(() => {
    return terms.find((item) => item.id === selectedTermId);
  }, [terms, selectedTermId]);

  const normalizeTermStatus = (status) => {
    return String(status || "").trim().toUpperCase();
  };

  const getVietnameseTermStatus = (status) => {
    const normalized = normalizeTermStatus(status);

    if (
      normalized === "IN_PROGRESS" ||
      normalized === "ONGOING" ||
      normalized === "DANG_DIEN_RA"
    ) {
      return "Đang diễn ra";
    }

    if (
      normalized === "UPCOMING" ||
      normalized === "SẮP_DIỄN_RA" ||
      normalized === "SAP_DIEN_RA" ||
      normalized === "NOT_STARTED"
    ) {
      return "Sắp diễn ra";
    }

    if (
      normalized === "COMPLETED" ||
      normalized === "FINISHED" ||
      normalized === "ENDED" ||
      normalized === "DA_KET_THUC"
    ) {
      return "Đã kết thúc";
    }

    if (!normalized) return "Chưa có trạng thái";
    return status;
  };

  const getTermStatusColor = (status) => {
    const normalized = normalizeTermStatus(status);

    if (
      normalized === "IN_PROGRESS" ||
      normalized === "ONGOING" ||
      normalized === "DANG_DIEN_RA"
    ) {
      return "success";
    }

    if (
      normalized === "UPCOMING" ||
      normalized === "SẮP_DIỄN_RA" ||
      normalized === "SAP_DIEN_RA" ||
      normalized === "NOT_STARTED"
    ) {
      return "warning";
    }

    if (
      normalized === "COMPLETED" ||
      normalized === "FINISHED" ||
      normalized === "ENDED" ||
      normalized === "DA_KET_THUC"
    ) {
      return "default";
    }

    return "processing";
  };

  const isEditableTerm = useMemo(() => {
    const normalized = normalizeTermStatus(selectedTerm?.status);
    return (
      normalized === "IN_PROGRESS" ||
      normalized === "ONGOING" ||
      normalized === "DANG_DIEN_RA"
    );
  }, [selectedTerm]);

  const handleChangeStrengths = (teacherId, values) => {
    if (!isEditableTerm) {
      return;
    }

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
      console.error(error);
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
      console.error(error);
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
                Trưởng bộ môn phân công chuyên môn phụ trách cho giảng viên theo từng kỳ thực tập
              </Text>
            </div>
          </div>

          <Button
            type="primary"
            onClick={handleSaveAll}
            disabled={!isEditableTerm || !selectedTermId}
          >
            Lưu toàn bộ
          </Button>
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

        {!selectedTermId ? (
          <Empty description="Vui lòng chọn kỳ thực tập" />
        ) : (
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
        )}
      </Card>
    </div>
  );
}