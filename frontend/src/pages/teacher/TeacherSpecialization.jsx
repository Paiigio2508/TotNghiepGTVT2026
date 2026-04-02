import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Form,
  Select,
  Button,
  message,
  Modal,
  Input,
  Tag,
  Space,
  Table,
  Typography,
  Empty,
} from "antd";
import { SpecializationAPI } from "../../api/SpecializationAPI";

const { Text } = Typography;

const TeacherSpecialization = ({
  form,
  loading,
  setLoading,
  onSuccess,
  teacherDetail,
}) => {
  const [specializations, setSpecializations] = useState([]);
  const [userId, setUserId] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [note, setNote] = useState("");
  const [pendingValues, setPendingValues] = useState(null);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [histories, setHistories] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [selectedSpecializationNames, setSelectedSpecializationNames] =
    useState([]);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUserId(parsed.userId);
      } catch (error) {
        console.log("Parse userData lỗi:", error);
      }
    }
  }, []);

  useEffect(() => {
    const loadSpecializations = async () => {
      try {
        const res = await SpecializationAPI.getAllTeacher();
        const raw = Array.isArray(res?.data) ? res.data : [];
        setSpecializations(raw.filter((item) => item.status === 0));
      } catch (error) {
        console.log(error);
        message.error("Không tải được danh sách chuyên ngành");
      }
    };

    loadSpecializations();
  }, []);

  useEffect(() => {
    if (!form) return;

    if (teacherDetail) {
      form.setFieldsValue({
        specializationIds:
          teacherDetail.specializations?.map((item) => item.id) || [],
      });
    }
  }, [teacherDetail, form]);

  useEffect(() => {
    setSelectedSpecializationNames(
      teacherDetail?.specializations?.map((item) => item.name) || []
    );
  }, [teacherDetail]);

  const currentSpecializationIds = useMemo(() => {
    return teacherDetail?.specializations?.map((item) => item.id) || [];
  }, [teacherDetail]);

  const handleSubmit = async (values) => {
    if (!userId) {
      message.error("Không tìm thấy giảng viên");
      return;
    }

    const newIds = [...(values.specializationIds || [])].sort();
    const oldIds = [...currentSpecializationIds].sort();
    const isSame = JSON.stringify(newIds) === JSON.stringify(oldIds);

    if (isSame) {
      message.warning("Không có thay đổi nào để cập nhật");
      return;
    }

    setPendingValues(values);
    setConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!note.trim()) {
      message.error("Vui lòng nhập lý do thay đổi");
      return;
    }

    try {
      if (!userId) {
        message.error("Không tìm thấy giảng viên");
        return;
      }

      setLoading?.(true);

      const payload = {
        userId,
        specializationIds: pendingValues?.specializationIds || [],
        note: note.trim(),
      };

      const res = await SpecializationAPI.updateSpecializations(payload);

      const selectedNames = specializations
        .filter((item) =>
          (pendingValues?.specializationIds || []).includes(item.id)
        )
        .map((item) => item.name);

      setSelectedSpecializationNames(selectedNames);

      form.setFieldsValue({
        specializationIds: pendingValues?.specializationIds || [],
      });

      message.success("Cập nhật thế mạnh thành công");

      setConfirmOpen(false);
      setNote("");
      setPendingValues(null);

      if (onSuccess) {
        onSuccess(res);
      }
    } catch (error) {
      console.log(error);
      message.error("Cập nhật thế mạnh thất bại");
    } finally {
      setLoading?.(false);
    }
  };

  const handleCloseModal = () => {
    setConfirmOpen(false);
    setNote("");
    setPendingValues(null);
  };

  const loadHistory = async () => {
    try {
      if (!userId) {
        message.error("Không tìm thấy giảng viên");
        return;
      }

      setHistoryLoading(true);
      setHistoryOpen(true);

      const res = await SpecializationAPI.getSpecializationHistory(userId);
      const raw = Array.isArray(res?.data) ? res.data : [];
      setHistories(raw);
    } catch (error) {
      console.log(error);
      message.error("Không tải được lịch sử thay đổi");
      setHistories([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const historyColumns = [
    {
      title: "Trước đó",
      dataIndex: "oldValue",
      key: "oldValue",
      render: (text) => text || "Không có",
    },
    {
      title: "Sau thay đổi",
      dataIndex: "newValue",
      key: "newValue",
      render: (text) => text || "Không có",
    },
    {
      title: "Lý do",
      dataIndex: "note",
      key: "note",
      render: (text) => text || "Không có",
    },
    {
      title: "Thời gian",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (text) =>
        text ? new Date(text).toLocaleString("vi-VN") : "",
    },
  ];

  return (
    <div>
      <Card
        title="Cập nhật chuyên ngành / thế mạnh"
        extra={<Button onClick={loadHistory}>Xem lịch sử thay đổi</Button>}
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Thế mạnh hiện tại: </Text>
          {selectedSpecializationNames.length > 0 ? (
            <Space wrap>
              {selectedSpecializationNames.map((name, index) => (
                <Tag color="blue" key={`${name}-${index}`}>
                  {name}
                </Tag>
              ))}
            </Space>
          ) : (
            <Text type="secondary">Chưa có thế mạnh nào</Text>
          )}
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Chuyên ngành / Thế mạnh"
            name="specializationIds"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn ít nhất 1 chuyên ngành",
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn chuyên ngành"
              options={specializations.map((item) => ({
                label: item.name,
                value: item.id,
              }))}
              allowClear
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Lưu thay đổi
              </Button>
              <Button onClick={loadHistory}>Xem history</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title="Xác nhận cập nhật thế mạnh"
        open={confirmOpen}
        onCancel={handleCloseModal}
        onOk={handleConfirmSave}
        confirmLoading={loading}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ disabled: !note.trim() }}
      >
        <Form layout="vertical">
          <Form.Item
            label="Lý do thay đổi"
            required
            validateStatus={!note.trim() && confirmOpen ? "error" : ""}
            help={
              !note.trim() && confirmOpen
                ? "Vui lòng nhập lý do thay đổi"
                : ""
            }
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập lý do thay đổi..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Lịch sử thay đổi thế mạnh"
        open={historyOpen}
        onCancel={() => setHistoryOpen(false)}
        footer={null}
        width={800}
      >
        <Table
          loading={historyLoading}
          dataSource={histories}
          rowKey={(record, index) => index}
          pagination={{ pageSize: 5 }}
          locale={{
            emptyText: <Empty description="Chưa có lịch sử thay đổi" />,
          }}
          columns={historyColumns}
        />
      </Modal>
    </div>
  );
};

export default TeacherSpecialization;