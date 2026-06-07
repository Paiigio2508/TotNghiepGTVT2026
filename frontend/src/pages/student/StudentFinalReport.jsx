import {
  Card,
  Typography,
  Tag,
  Divider,
  Upload,
  Button,
  message,
  Row,
  Col,
  Spin,
  Alert,
  Descriptions,
} from "antd";
import {
  UploadOutlined,
  FileTextOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { FinalReportAPI } from "../../api/FinalReportAPI";
import { AssignmentsAPI } from "../../api/AssignmentsAPI";

const { Title, Text, Paragraph } = Typography;

export default function StudentFinalReport() {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const userId = userData?.userId;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [currentTerm, setCurrentTerm] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [finalReport, setFinalReport] = useState(null);

  const [fileList, setFileList] = useState([]);

  const loadFinalReport = async (advisorAssignmentId) => {
    try {
      const res = await FinalReportAPI.getByAdvisorAssignmentId(
        advisorAssignmentId
      );

      if (res.status === 204 || !res.data) {
        setFinalReport(null);
        setFileList([]);
        return;
      }

      const data = res.data;
      setFinalReport(data);

      if (data.fileUrl) {
        setFileList([
          {
            uid: "-1",
            name: data.originalFileName || "final_report",
            status: "done",
            url: data.fileUrl,
          },
        ]);
      } else {
        setFileList([]);
      }
    } catch {
      setFinalReport(null);
      setFileList([]);
    }
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const assignmentRes = await AssignmentsAPI.getCurrentByStudentUser(
        userId
      );

      const assignmentData = assignmentRes.data?.data || assignmentRes.data;

      if (!assignmentData) {
        message.warning("Bạn chưa được phân công giảng viên hướng dẫn!");
        return;
      }

      setAssignment(assignmentData);

      setCurrentTerm({
        id: assignmentData.termId,
        name: assignmentData.termName,
        academicYear: assignmentData.academicYear,
        startDate: assignmentData.startDate,
        endDate: assignmentData.endDate,
      });

      await loadFinalReport(assignmentData.id);
    } catch (err) {
      console.log(err);
      message.error("Tải dữ liệu báo cáo cuối kỳ thất bại!");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId, loadData]);

  const renderStatus = () => {
    if (!finalReport) return <Tag color="default">Chưa nộp</Tag>;

    switch (finalReport.status) {
      case "SUBMITTED":
        return <Tag color="blue">Đã nộp, chờ giảng viên duyệt</Tag>;

      case "NEED_REVISION":
        return <Tag color="orange">Cần chỉnh sửa</Tag>;

      case "TEACHER_APPROVED":
        return <Tag color="purple">Giảng viên đã duyệt</Tag>;

      case "ADMIN_APPROVED":
        return <Tag color="green">Admin đã duyệt</Tag>;

      case "GRADED":
        return <Tag color="cyan">Đã chấm điểm</Tag>;

      default:
        return <Tag color="default">{finalReport.status}</Tag>;
    }
  };

  const getFinalReportRange = () => {
    if (!currentTerm?.endDate) {
      return {
        openDate: null,
        dueDate: null,
      };
    }

    // Mở nộp trước ngày kết thúc kỳ 1 tháng
    const openDate = dayjs(currentTerm.endDate).subtract(1, "month");

    // Hạn nộp = ngày mở nộp + 21 ngày
    const dueDate = openDate.add(21, "day");

    return {
      openDate,
      dueDate,
    };
  };

  const { openDate, dueDate } = getFinalReportRange();

  const isBeforeSubmitTime = openDate
    ? dayjs().isBefore(openDate, "day")
    : true;

  const isAfterSubmitTime = dueDate
    ? dayjs().isAfter(dueDate, "day")
    : true;

  const isReportLocked =
    finalReport?.status === "TEACHER_APPROVED" ||
    finalReport?.status === "ADMIN_APPROVED" ||
    finalReport?.status === "GRADED";

  const disableSubmit =
    isReportLocked || isBeforeSubmitTime || isAfterSubmitTime;

  const getSubmitButtonText = () => {
    if (!finalReport) return "Nộp báo cáo cuối kỳ";

    if (finalReport.status === "NEED_REVISION") {
      return "Nộp lại báo cáo";
    }

    return "Cập nhật báo cáo";
  };

  const getFinalReportTimeText = () => {
    if (!openDate || !dueDate) return "-";

    return `${openDate.format("DD/MM/YYYY")} - ${dueDate.format(
      "DD/MM/YYYY"
    )}`;
  };

  const getDisableAlert = () => {
    if (isReportLocked) {
      return {
        type: "warning",
        message: "Báo cáo đã được duyệt",
        description:
          "Bạn không thể nộp lại báo cáo sau khi giảng viên hoặc admin đã duyệt/chấm điểm.",
      };
    }

    if (isBeforeSubmitTime) {
      return {
        type: "info",
        message: "Chưa đến thời gian nộp báo cáo cuối kỳ",
        description: `Thời gian nộp bắt đầu từ ngày ${
          openDate ? openDate.format("DD/MM/YYYY") : "-"
        }.`,
      };
    }

    if (isAfterSubmitTime) {
      return {
        type: "error",
        message: "Đã quá hạn nộp báo cáo cuối kỳ",
        description: `Hạn nộp báo cáo cuối kỳ là ngày ${
          dueDate ? dueDate.format("DD/MM/YYYY") : "-"
        }.`,
      };
    }

    return null;
  };

  const handleSubmit = async () => {
    if (!assignment?.id) {
      message.warning("Không tìm thấy phân công giảng viên hướng dẫn!");
      return;
    }

    if (disableSubmit) {
      if (isBeforeSubmitTime) {
        message.warning("Chưa đến thời gian nộp báo cáo cuối kỳ!");
        return;
      }

      if (isAfterSubmitTime) {
        message.warning("Đã quá hạn nộp báo cáo cuối kỳ!");
        return;
      }

      message.warning("Báo cáo đã bị khóa, không thể nộp lại!");
      return;
    }

    if (fileList.length === 0) {
      message.warning("Vui lòng chọn file báo cáo!");
      return;
    }

    const file = fileList[0].originFileObj || fileList[0];

    if (!file || file.url) {
      message.warning("Vui lòng chọn file mới trước khi nộp!");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("advisorAssignmentId", assignment.id);

      await FinalReportAPI.submitFinalReport(formData);

      toast.success("Nộp báo cáo cuối kỳ thành công!");

      await loadFinalReport(assignment.id);
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Nộp báo cáo cuối kỳ thất bại!"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spin size="large" />;

  const disableAlert = getDisableAlert();

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <Row gutter={24}>
        <Col span={16}>
          <Card style={{ borderRadius: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Title level={3} style={{ margin: 0 }}>
                <FileTextOutlined /> Báo cáo cuối kỳ
              </Title>

              {finalReport?.score !== null &&
                finalReport?.score !== undefined && (
                  <Tag color="red" className="fs-4" style={{ margin: 0 }}>
                    {finalReport.score}/10
                  </Tag>
                )}
            </div>

            <Text type="secondary">
              Thời gian nộp: {getFinalReportTimeText()}
            </Text>

            <div style={{ marginTop: 10 }}>{renderStatus()}</div>

            <Divider />

            <Descriptions bordered column={1}>
              <Descriptions.Item label="Kỳ thực tập">
                {currentTerm?.name || "-"} ({currentTerm?.academicYear || "-"})
              </Descriptions.Item>

              <Descriptions.Item label="Giảng viên hướng dẫn">
                {assignment?.teacherName ||
                  assignment?.teacher?.fullName ||
                  "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Đề tài">
                {assignment?.topicTitle || assignment?.topic?.title || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày nộp">
                {finalReport?.submitDate
                  ? dayjs(finalReport.submitDate).format("DD/MM/YYYY HH:mm")
                  : "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Nhận xét giảng viên">
                {finalReport?.comment || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="File đã nộp">
                {finalReport?.fileUrl ? (
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => window.open(finalReport.fileUrl, "_blank")}
                    style={{ padding: 0 }}
                  >
                    {finalReport.originalFileName || "Xem file"}
                  </Button>
                ) : (
                  "-"
                )}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Paragraph>
              Sinh viên chỉ được nộp báo cáo cuối kỳ trong thời gian hệ thống
              cho phép. Sau khi giảng viên hoặc admin đã duyệt, báo cáo sẽ bị
              khóa và không thể nộp lại.
            </Paragraph>
          </Card>
        </Col>

        <Col span={8}>
          <Card style={{ borderRadius: 16 }}>
            <Title level={4}>
              <FileTextOutlined /> File báo cáo
            </Title>

            <Divider />

            {disableAlert && (
              <Alert
                type={disableAlert.type}
                showIcon
                style={{ marginBottom: 16 }}
                message={disableAlert.message}
                description={disableAlert.description}
              />
            )}

            {!disableSubmit && finalReport?.status === "NEED_REVISION" && (
              <Alert
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
                message="Giảng viên yêu cầu chỉnh sửa"
                description={finalReport?.comment || "Vui lòng nộp lại báo cáo."}
              />
            )}

            <Upload
              fileList={fileList}
              beforeUpload={(file) => {
                setFileList([file]);
                return false;
              }}
              onPreview={(file) => {
                if (file.url) {
                  window.open(file.url, "_blank");
                }
              }}
              onRemove={() => setFileList([])}
              maxCount={1}
              disabled={disableSubmit}
            >
              <Button icon={<UploadOutlined />} disabled={disableSubmit}>
                Chọn file
              </Button>
            </Upload>

            <Button
              type="primary"
              block
              style={{ marginTop: 16 }}
              onClick={handleSubmit}
              loading={submitting}
              disabled={disableSubmit}
            >
              {getSubmitButtonText()}
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}