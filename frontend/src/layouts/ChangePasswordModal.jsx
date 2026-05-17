import { Modal, Form, Input, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { AuthAPI } from "../api/AuthAPI";

export default function ChangePasswordModal({ open, onClose }) {
  const [form] = Form.useForm();

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const userId = userData?.userId;

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        userId,
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      };

      const res = await AuthAPI.changePassword(payload);

      if (res.data?.success === false) {
        toast.error(res.data.message || "Đổi mật khẩu thất bại!");
        return;
      }

      toast.success("Đổi mật khẩu thành công!");

      form.resetFields();
      onClose();
    } catch (error) {
      if (error?.errorFields) return;

      message.error(
        error?.response?.data?.message || "Không thể đổi mật khẩu!"
      );
    }
  };

  return (
    <Modal
      open={open}
      title="Đổi mật khẩu"
      okText="Cập nhật"
      cancelText="Hủy"
      onOk={handleSubmit}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      centered
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="oldPassword"
          label="Mật khẩu hiện tại"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập mật khẩu hiện tại!",
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập mật khẩu hiện tại"
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập mật khẩu mới!",
            },
            {
              min: 6,
              message: "Mật khẩu mới phải có ít nhất 6 ký tự!",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const oldPassword = getFieldValue("oldPassword");

                if (!value || !oldPassword || value !== oldPassword) {
                  return Promise.resolve();
                }

                return Promise.reject(
                  new Error("Mật khẩu mới không được trùng mật khẩu hiện tại!")
                );
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập mật khẩu mới"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu mới"
          dependencies={["newPassword"]}
          rules={[
            {
              required: true,
              message: "Vui lòng xác nhận mật khẩu mới!",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }

                return Promise.reject(
                  new Error("Xác nhận mật khẩu không khớp!")
                );
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập lại mật khẩu mới"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}