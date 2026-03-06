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
import { toast } from "react-toastify";

const { Title, Text, Paragraph } = Typography;

export default function StudentDeadlineDetail() {
  const { deadlineId } = useParams();

  const userData = JSON.parse(localStorage.getItem("userData"));
  const userId = userData?.userId;

  const [deadline, setDeadline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const loadDetail = useCallback(async () => {
   
    try {
      setLoading(true);

      const res = await DeadlineAPI.getDeadlineDetailForStudent(
        deadlineId,
        userId
      );
        console.log(res.data);
      const data = res.data;
      setDeadline({ ...data });

      // nếu đã có file → hiển thị file lên Upload
      if (data.fileUrl) {
        setFileList([
          {
            uid: "-1",
            name: data.originalFileName || "weekly_report",
            status: "done",
            url: data.fileUrl,
          },
        ]);
      } else {
        setFileList([]);
      }
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
  }, [loadDetail, deadlineId, userId]);

  if (loading) return <Spin size="large" />;

  if (!deadline) return <div>Không tìm thấy deadline</div>;

  const isExpired = dayjs().isAfter(dayjs(deadline.dueDate));

  // chỉ khóa khi quá hạn
  const disableSubmit = isExpired;

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

      // file có thể từ server hoặc upload mới
      const file = fileList[0].originFileObj || fileList[0];
      formData.append("file", file);

      formData.append("deadlineId", deadlineId);
      formData.append("userId", userId);

      await WeeklyReportAPI.submitWeeklyReport(formData);

      toast.success("Nộp bài thành công!");

      await loadDetail();
      setFileList([]);
    } catch (error) {
      console.log(error);
      toast.error("Nộp bài thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <Row gutter={24}>
        {/* LEFT SIDE */}
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
                Tuần {deadline.weekNo} - {deadline.title}
              </Title>

     
                <Tag color="red" className="text-danger fs-4" style={{ margin: 0 }}>
                  {deadline.score ?? 0}/10
                </Tag>
     
            </div>
            <Text type="secondary">
              Hạn nộp: {dayjs(deadline.dueDate).format("DD/MM/YYYY HH:mm")}
            </Text>

            <div style={{ marginTop: 10 }}>{getStatusTag()}</div>

            <Divider />

            <Paragraph>{deadline.description}</Paragraph>
          </Card>
        </Col>

        {/* RIGHT SIDE */}
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
              onPreview={(file) => {
                if (file.url) {
                  window.open(file.url);
                }
              }}
              onRemove={() => setFileList([])}
              disabled={disableSubmit}
              maxCount={1}
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
              {deadline.status === "SUBMITTED" ? "Nộp lại" : "Nộp bài"}
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
