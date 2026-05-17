import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Divider,
  message,
  Tag,
} from "antd";
import { useNavigate } from "react-router-dom";
import { RetweetOutlined, EditOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { FaHome } from "react-icons/fa";
import { TermAPI } from "../../api/TermAPI";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { toast } from "react-toastify";

export default function HocKyManage() {
  const [data, setData] = useState([]);
  const [dataGoc, setDataGoc] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [searchForm] = Form.useForm();
  const [termForm] = Form.useForm();

  const navigate = useNavigate();

  /* ================= LOAD ================= */

  const loadHocKy = async () => {
    try {
      const res = await TermAPI.getAll();

      const termList = Array.isArray(res.data) ? res.data : [];

      setData(termList);
      setDataGoc(termList);
    } catch (err) {
      message.error("Tải danh sách học kỳ thất bại!");
    }
  };

  useEffect(() => {
    loadHocKy();
  }, []);

  /* ================= SEARCH ================= */

  const handleSearch = (keyword) => {
    if (!keyword || keyword.trim() === "") {
      setData(dataGoc);
      return;
    }

    const lowerKeyword = keyword.toLowerCase();

    const result = dataGoc.filter(
      (item) =>
        item.name?.toLowerCase().includes(lowerKeyword) ||
        item.academicYear?.toLowerCase().includes(lowerKeyword)
    );

    setData(result);
  };

  /* ================= DISABLED DATE ================= */

  const disabledStartDate = (current) => {
    // Ngày bắt đầu phải >= ngày hiện tại
    return current && current.isBefore(dayjs(), "day");
  };

  const disabledEndDate = (current) => {
    const startDate = termForm.getFieldValue("startDate");

    if (!current) return false;

    // Nếu chưa chọn ngày bắt đầu thì vẫn không cho chọn ngày quá khứ
    if (!startDate) {
      return current.isBefore(dayjs(), "day");
    }

    // Ngày kết thúc phải > ngày bắt đầu
    return !current.isAfter(startDate, "day");
  };

  const disabledRegistrationDate = (current) => {
    const startDate = termForm.getFieldValue("startDate");
    const endDate = termForm.getFieldValue("endDate");

    if (!current) return false;

    if (startDate && current.isBefore(startDate, "day")) {
      return true;
    }

    if (endDate && current.isAfter(endDate, "day")) {
      return true;
    }

    return false;
  };

  /* ================= EDIT ================= */

  const onEdit = (record) => {
    setEditing(record);

    termForm.setFieldsValue({
      ...record,
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null,
      registrationDeadline: record.registrationDeadline
        ? dayjs(record.registrationDeadline)
        : null,
    });

    setOpen(true);
  };

  /* ================= SUBMIT ================= */

  const onSubmit = async () => {
    try {
      const values = await termForm.validateFields();

      const payload = {
        ...values,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        registrationDeadline: values.registrationDeadline.format("YYYY-MM-DD"),
      };

      let res;

      if (editing) {
        res = await TermAPI.update(editing.id, payload);
      } else {
        res = await TermAPI.create(payload);
      }

      if (res.data.success === false) {
        toast.error(res.data.message || "Thao tác thất bại!");
        return;
      }

      toast.success(editing ? "Cập nhật thành công!" : "Thêm thành công!");

      setOpen(false);
      termForm.resetFields();
      setEditing(null);
      loadHocKy();
    } catch (err) {
      if (err?.errorFields) return;

      console.error("Lỗi hệ thống:", err);
      toast.error("Không kết nối được server!");
    }
  };

  /* ================= STATUS ================= */

  const renderStatus = (status) => {
    switch (status) {
      case "SAP_DIEN_RA":
        return <Tag color="blue">Sắp diễn ra</Tag>;
      case "DANG_DIEN_RA":
        return <Tag color="green">Đang diễn ra</Tag>;
      case "KET_THUC":
      case "DA_KET_THUC":
        return <Tag color="red">Đã kết thúc</Tag>;
      default:
        return <Tag>Không xác định</Tag>;
    }
  };

  /* ================= COLUMNS ================= */

  const columns = [
    {
      title: "Tên học kỳ",
      dataIndex: "name",
    },
    {
      title: "Năm học",
      dataIndex: "academicYear",
    },
    {
      title: "Hạn đăng ký đề tài",
      dataIndex: "registrationDeadline",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      render: (value) => value || "-",
    },
    {
      title: "Bắt đầu",
      dataIndex: "startDate",
    },
    {
      title: "Kết thúc",
      dataIndex: "endDate",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: renderStatus,
    },
    {
      title: "Hành động",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            danger
            size="small"
            disabled={
              record.status === "SAP_DIEN_RA" ||
              record.status === "KET_THUC" ||
              record.status === "DA_KET_THUC"
            }
            onClick={() =>
              navigate(`/admin/assignments/${record.id}`, {
                state: { term: record },
              })
            }
          >
            Phân công
          </Button>

          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(record);
            }}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Divider titlePlacement="center">
        <h2 className="fw-bold">
          <FaHome /> Quản lý học kỳ
        </h2>
      </Divider>

      {/* SEARCH */}
      <div className="form-header">
        <Form
          form={searchForm}
          onValuesChange={(changedValues) =>
            handleSearch(changedValues.timKiem)
          }
        >
          <div className="d-flex justify-content-center gap-4">
            <Form.Item label="Tìm kiếm" name="timKiem">
              <Input placeholder="Tên học kỳ / Năm học..." allowClear />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                icon={<RetweetOutlined />}
                onClick={() => {
                  searchForm.resetFields();
                  setData(dataGoc);
                }}
              >
                Làm mới
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>

      {/* ADD BUTTON */}
      <Space className="float-end mt-4 mb-4">
        <Button
          type="primary"
          onClick={() => {
            setEditing(null);
            termForm.resetFields();
            setOpen(true);
          }}
        >
          Thêm học kỳ
        </Button>
      </Space>

      {/* TABLE */}
      <Table
        className="custom-table"
        dataSource={data}
        columns={columns}
        rowKey="id"
        pagination={{
          showQuickJumper: true,
          defaultPageSize: 5,
        }}
      />

      {/* MODAL */}
      <Modal
        open={open}
        title={editing ? "Sửa học kỳ" : "Thêm học kỳ"}
        okText={editing ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
        onCancel={() => {
          setOpen(false);
          setEditing(null);
          termForm.resetFields();
        }}
        onOk={onSubmit}
        centered
      >
        <Form form={termForm} layout="vertical">
          <Form.Item
            name="name"
            label="Tên học kỳ"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tên học kỳ!",
              },
            ]}
          >
            <Input placeholder="Nhập tên học kỳ" />
          </Form.Item>

          <Form.Item
            name="academicYear"
            label="Năm học"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập năm học!",
              },
              {
                pattern: /^[0-9]{4}-[0-9]{4}$/,
                message: "Năm học phải có định dạng 2024-2025",
              },
            ]}
          >
            <Input placeholder="Ví dụ: 2024-2025" />
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn ngày bắt đầu!",
              },
              {
                validator: (_, value) => {
                  if (!value) {
                    return Promise.resolve();
                  }

                  if (value.isBefore(dayjs(), "day")) {
                    return Promise.reject(
                      new Error(
                        "Ngày bắt đầu phải lớn hơn hoặc bằng ngày hiện tại!"
                      )
                    );
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày bắt đầu"
              disabledDate={disabledStartDate}
              onChange={(value) => {
                const endDate = termForm.getFieldValue("endDate");
                const registrationDeadline = termForm.getFieldValue(
                  "registrationDeadline"
                );

                if (value && endDate && !endDate.isAfter(value, "day")) {
                  termForm.setFieldsValue({
                    endDate: null,
                  });
                }

                if (
                  value &&
                  registrationDeadline &&
                  registrationDeadline.isBefore(value, "day")
                ) {
                  termForm.setFieldsValue({
                    registrationDeadline: null,
                  });
                }
              }}
            />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="Ngày kết thúc"
            dependencies={["startDate"]}
            rules={[
              {
                required: true,
                message: "Vui lòng chọn ngày kết thúc!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const start = getFieldValue("startDate");

                  if (!value || !start) {
                    return Promise.resolve();
                  }

                  if (value.isAfter(start, "day")) {
                    return Promise.resolve();
                  }

                  return Promise.reject(
                    new Error("Ngày kết thúc phải lớn hơn ngày bắt đầu!")
                  );
                },
              }),
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày kết thúc"
              disabledDate={disabledEndDate}
              onChange={(value) => {
                const registrationDeadline = termForm.getFieldValue(
                  "registrationDeadline"
                );

                if (
                  value &&
                  registrationDeadline &&
                  registrationDeadline.isAfter(value, "day")
                ) {
                  termForm.setFieldsValue({
                    registrationDeadline: null,
                  });
                }
              }}
            />
          </Form.Item>

          <Form.Item
            name="registrationDeadline"
            label="Hạn đăng ký đề tài"
            dependencies={["startDate", "endDate"]}
            rules={[
              {
                required: true,
                message: "Vui lòng chọn hạn đăng ký đề tài!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const start = getFieldValue("startDate");
                  const end = getFieldValue("endDate");

                  if (!value || !start || !end) {
                    return Promise.resolve();
                  }

                  if (value.isBefore(start, "day")) {
                    return Promise.reject(
                      new Error(
                        "Hạn đăng ký đề tài phải lớn hơn hoặc bằng ngày bắt đầu!"
                      )
                    );
                  }

                  if (value.isAfter(end, "day")) {
                    return Promise.reject(
                      new Error(
                        "Hạn đăng ký đề tài phải nhỏ hơn hoặc bằng ngày kết thúc!"
                      )
                    );
                  }

                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Chọn hạn đăng ký đề tài"
              disabledDate={disabledRegistrationDate}
            />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Nhập mô tả nếu có" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}