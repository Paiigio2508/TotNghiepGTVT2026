import React, { useEffect, useMemo, useState, useCallback } from "react";
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

const TeacherSpecialization = ({ form, loading, setLoading }) => {
  const [specializations, setSpecializations] = useState([]);
  const [userId, setUserId] = useState(null);
  const [currentSpecializations, setCurrentSpecializations] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [note, setNote] = useState("");
  const [pendingValues, setPendingValues] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [histories, setHistories] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    try {
      const userData = localStorage.getItem("userData");
      const parsed = userData ? JSON.parse(userData) : null;
      setUserId(parsed?.userId ?? null);
    } catch {
      setUserId(null);
    }
  }, []);

  const getArrayData = (res) => {
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res)) return res;
    return [];
  };

  const loadSpecializations = useCallback(async () => {
    try {
      const res = await SpecializationAPI.getAllTeacher();
      const raw = getArrayData(res);
      setSpecializations(raw.filter((item) => item.status === 0));
    } catch {
      message.error("Không tải được danh sách chuyên ngành");
    }
  }, []);

  const loadCurrentSpecializations = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await SpecializationAPI.getSpecializationByTeacher(userId);
      const raw = getArrayData(res);
      setCurrentSpecializations(raw);
    } catch {
      setCurrentSpecializations([]);
      message.error("Không tải được thế mạnh hiện tại");
    }
  }, [userId]);

  useEffect(() => {
    loadSpecializations();
  }, [loadSpecializations]);

  useEffect(() => {
    if (userId != null) {
      loadCurrentSpecializations();
    }
  }, [userId, loadCurrentSpecializations]);

  useEffect(() => {
    form?.setFieldsValue({
      specializationIds: currentSpecializations.map((item) => item.id),
    });
  }, [currentSpecializations, form]);

  const currentSpecializationIds = useMemo(
    () => currentSpecializations.map((item) => item.id).sort(),
    [currentSpecializations],
  );

  const historyColumns = useMemo(
    () => [
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
        render: (text) => (text ? new Date(text).toLocaleString("vi-VN") : ""),
      },
    ],
    [],
  );

  const resetConfirmState = () => {
    setConfirmOpen(false);
    setNote("");
    setPendingValues(null);
  };

  const handleSubmit = (values) => {
    if (!userId) {
      message.error("Không tìm thấy giảng viên");
      return;
    }

    const newIds = [...(values?.specializationIds || [])].sort();
    const isSame =
      JSON.stringify(newIds) === JSON.stringify(currentSpecializationIds);

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

    if (!userId) {
      message.error("Không tìm thấy giảng viên");
      return;
    }

    try {
      setLoading?.(true);

      const payload = {
        userId,
        specializationIds: pendingValues?.specializationIds || [],
        note: note.trim(),
      };

      await SpecializationAPI.updateSpecializations(payload);
      await loadCurrentSpecializations();

      message.success("Cập nhật thế mạnh thành công");
      resetConfirmState();
    } catch {
      message.error("Cập nhật thế mạnh thất bại");
    } finally {
      setLoading?.(false);
    }
  };

  const loadHistory = async () => {
    if (!userId) {
      message.error("Không tìm thấy giảng viên");
      return;
    }

    try {
      setHistoryOpen(true);
      setHistoryLoading(true);

      const res = await SpecializationAPI.getSpecializationHistory(userId);
      setHistories(getArrayData(res));
    } catch {
      setHistories([]);
      message.error("Không tải được lịch sử thay đổi");
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div>
      <Card
        title="Cập nhật chuyên ngành / thế mạnh"
        extra={<Button onClick={loadHistory}>Xem lịch sử thay đổi</Button>}
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Thế mạnh hiện tại: </Text>
          {currentSpecializations.length > 0 ? (
            <Space wrap>
              {currentSpecializations.map((item) => (
                <Tag color="blue" key={item.id}>
                  {item.name}
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
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title="Xác nhận cập nhật thế mạnh"
        open={confirmOpen}
        onCancel={resetConfirmState}
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
              !note.trim() && confirmOpen ? "Vui lòng nhập lý do thay đổi" : ""
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
          rowKey={(record) => record.id}
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
