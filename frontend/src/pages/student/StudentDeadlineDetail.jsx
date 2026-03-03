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
} from "antd";
import { UploadOutlined, FileTextOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import { DeadlineAPI } from "../../api/DeadlineAPI";
import { WeeklyReportAPI } from "../../api/WeeklyReportAPI";

const { Title, Text, Paragraph } = Typography;

export default function StudentDeadlineDetail() {
  const { deadlineId } = useParams();

  const userData = JSON.parse(localStorage.getItem("userData"));
  const userId = userData?.userId;

  const [deadline, setDeadline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // ✅ dùng useCallback để tránh recreate function
  const loadDetail = useCallback(async () => {
    try {
      setLoading(true);

      const res = await DeadlineAPI.getDeadlineDetailForStudent(
        deadlineId,
        userId
      );

      console.log("Reloaded:", res.data);

      // force re-render
      setDeadline({ ...res.data });
    } catch (err) {
      console.log(err);
      message.error("Tải chi tiết thất bại!");
    } finally {
      setLoading(false);
    }
  }, [deadlineId, userId]);

  useEffect(() => {
    if (deadlineId && userId) {
      loadDetail();
    }
  }, [loadDetail]);

  if (loading) return <Spin size="large" />;

  if (!deadline) return <div>Không tìm thấy deadline</div>;

  const isExpired = dayjs().isAfter(dayjs(deadline.dueDate));

 const alreadySubmitted =
   deadline.status === "SUBMITTED" || deadline.status === "LATE" || isExpired;

  const getStatusTag = () => {
    if (deadline.status === "SUBMITTED") return <Tag color="green">Đã nộp</Tag>;

    if (deadline.status === "LATE") return <Tag color="orange">Nộp trễ</Tag>;

    if (isExpired) return <Tag color="red">Quá hạn</Tag>;

    return <Tag color="blue">Chưa nộp</Tag>;
  };

  const handleSubmit = async () => {
    if (fileList.length === 0) {
      message.warning("Chọn file trước khi nộp!");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("file", fileList[0]);
      formData.append("deadlineId", deadlineId);
      formData.append("userId", userId);

      await WeeklyReportAPI.submitWeeklyReport(formData);

      message.success("Nộp bài thành công!");

      // reload data
      await loadDetail();

      setFileList([]);
    } catch (error) {
      console.log(error);
      message.error("Nộp bài thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <Row gutter={24}>
        <Col span={16}>
          <Card style={{ borderRadius: 16 }}>
            <Title level={3}>
              Tuần {deadline.weekNo} - {deadline.title}
            </Title>

            <Text type="secondary">
              Hạn nộp: {dayjs(deadline.dueDate).format("DD/MM/YYYY HH:mm")}
            </Text>

            <div style={{ marginTop: 10 }}>{getStatusTag()}</div>

            <Divider />

            <Paragraph>{deadline.description}</Paragraph>
          </Card>
        </Col>

        <Col span={8}>
          <Card style={{ borderRadius: 16 }}>
            <Title level={4}>
              <FileTextOutlined /> Bài của bạn
            </Title>

            <Divider />

            <Upload
              fileList={fileList}
              beforeUpload={(file) => {
                setFileList([file]);
                return false;
              }}
              onRemove={() => setFileList([])}
              disabled={alreadySubmitted}
            >
              <Button icon={<UploadOutlined />} disabled={alreadySubmitted}>
                Chọn file
              </Button>
            </Upload>

            <Button
              type="primary"
              block
              style={{ marginTop: 16 }}
              onClick={handleSubmit}
              loading={submitting}
              disabled={alreadySubmitted}
            >
              Nộp bài
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
