import React from "react";
import { Card, Form, Select, Button } from "antd";

const TeacherSpecialization = ({
  form,
  specializations = [],
  onFinish,
  loading = false,
}) => {
  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Cập nhật chuyên ngành / thế mạnh"
        style={{ maxWidth: 900, borderRadius: 12 }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
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
              options={specializations?.map((item) => ({
                label: item.name,
                value: item.id,
              }))}
              allowClear
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={loading}>
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default TeacherSpecialization;
