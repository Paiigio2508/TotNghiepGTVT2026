import { Modal, Upload, message } from "antd";
import { useState, useEffect } from "react";
import { PlusOutlined } from "@ant-design/icons";
import "./UpLoadImage.css";

export default function UpLoadImage({ onFileUpload, defaultImage }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [fileList, setFileList] = useState([]);

  /* =========================
     LOAD ẢNH KHI UPDATE
  ========================= */
  useEffect(() => {
    if (defaultImage) {
      setFileList([
        {
          uid: "-1",
          name: "image.png",
          status: "done",
          url: defaultImage,
        },
      ]);
    } else {
      setFileList([]);
    }
  }, [defaultImage]);

  const handleCancel = () => setPreviewOpen(false);

  /* =========================
     PREVIEW
  ========================= */
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      const reader = new FileReader();
      reader.readAsDataURL(file.originFileObj);
      reader.onload = () => {
        file.preview = reader.result;
        setPreviewImage(file.preview);
        setPreviewOpen(true);
        setPreviewTitle(file.name || "Preview");
      };
    } else {
      setPreviewImage(file.url || file.preview);
      setPreviewOpen(true);
      setPreviewTitle(file.name || "Preview");
    }
  };

  /* =========================
     HANDLE CHANGE
  ========================= */
  const handleChange = ({ fileList: newList }) => {
    setFileList(newList);

    // Nếu user xoá ảnh
    if (newList.length === 0) {
      onFileUpload(null);
    }
  };

  /* =========================
     VALIDATE FILE
  ========================= */
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ được upload file ảnh!");
      return Upload.LIST_IGNORE;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Ảnh phải nhỏ hơn 2MB!");
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  /* =========================
     UPLOAD CLOUDINARY
  ========================= */
  const customRequest = async ({ file, onSuccess, onError }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "pcoffe_upload");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dm0w2qws8/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const json = await res.json();

      if (json.secure_url) {
        onFileUpload(json.secure_url);
        onSuccess("OK");
      } else {
        message.error("Upload thất bại!");
        onError("Upload error");
      }
    } catch (err) {
      message.error("Có lỗi khi upload!");
      onError(err);
    }
  };

  return (
    <>
      <Upload
        listType="picture-circle"
        fileList={fileList}
        accept="image/*"
        beforeUpload={beforeUpload}
        onPreview={handlePreview}
        onChange={handleChange}
        customRequest={customRequest}
        maxCount={1}
        className="custom-upload"
      >
        {fileList.length >= 1 ? null : (
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        )}
      </Upload>

      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </>
  );
}
