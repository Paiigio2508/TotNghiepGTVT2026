import { Avatar, Input, Button } from "antd";
import { SendOutlined, UploadOutlined } from "@ant-design/icons";

import { useEffect, useRef, useState } from "react";
import { ChatAPI } from "../api/ChatAPI";

import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export default function ChatWidget({ roomId, studentName, mode = "page" }) {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [uploading, setUploading] = useState(false);

  const bottomRef = useRef(null);

  const userData = JSON.parse(localStorage.getItem("userData"));

  /* LOAD OLD MESSAGES */

  const loadMessages = async () => {
    try {
      const res = await ChatAPI.getMessages(roomId);

      const safeData = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      setMessages(safeData);
    } catch (err) {
      console.error(err);
      setMessages([]);
    }
  };

  /* LOAD HISTORY */

  useEffect(() => {
    if (roomId) loadMessages();
  }, [roomId]);

  /* AUTO SCROLL */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* CONNECT WEBSOCKET */

  useEffect(() => {
    if (!roomId) return;

    const socket = new SockJS("http://localhost:8080/ws");

    const stompClient = new Client({
      webSocketFactory: () => socket,

      reconnectDelay: 5000,

      onConnect: () => {
        stompClient.subscribe(`/topic/room/${roomId}`, (msg) => {
          const message = JSON.parse(msg.body);

          setMessages((prev) => [...prev, message]);
        });
      },
    });

    stompClient.activate();

    return () => stompClient.deactivate();
  }, [roomId]);

  /* SEND TEXT MESSAGE */

  const sendMessage = async () => {
    if (!content.trim()) return;

    try {
      await ChatAPI.sendMessage({
        roomId,
        senderId: userData.userId,
        message: content,
        messageType: "TEXT",
      });

      setContent("");
    } catch (err) {
      console.error(err);
    }
  };

  /* UPLOAD FILE */

const handleUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("roomId", roomId);
    formData.append("senderId", userData.userId);

    await ChatAPI.sendFile(formData);
  } catch (err) {
    console.error(err);
  }
};
const getDownloadUrl = (url) => {
  return url.replace("/upload/", "/upload/fl_attachment/");
};
  return (
    <div
      style={{
        height: mode === "page" ? "100%" : "500px",
        width: mode === "page" ? "100%" : "350px",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        position: mode === "popup" ? "fixed" : "relative",
        right: mode === "popup" ? 20 : "auto",
        bottom: mode === "popup" ? 80 : "auto",
        boxShadow: mode === "popup" ? "0 4px 12px rgba(0,0,0,0.2)" : "none",
        borderRadius: mode === "popup" ? 10 : 0,
        overflow: "hidden",
        zIndex: 1000,
      }}
    >
      {/* HEADER */}

      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #eee",
          fontWeight: 600,
        }}
      >
        Chat với {studentName}
      </div>

      {/* MESSAGE LIST */}

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          background: "#f0f2f5",
        }}
      >
        {messages.map((msg) => {
          const isMe =
            msg.sender?.id === userData.userId ||
            msg.senderId === userData.userId;

          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                marginBottom: 12,
                alignItems: "flex-end",
                gap: 6,
              }}
            >
              {!isMe && <Avatar size={32}>{studentName?.charAt(0)}</Avatar>}

              <div
                style={{
                  maxWidth: "65%",
                  padding: "8px 12px",
                  borderRadius: 12,
                  background:
                    msg.messageType === "FILE"
                      ? "transparent"
                      : isMe
                      ? "#1677ff"
                      : "#e4e6eb",
                  color: isMe ? "#fff" : "#000",
                }}
              >
                {/* TEXT MESSAGE */}

                {msg.messageType === "TEXT" && msg.message}

                {/* IMAGE MESSAGE */}

                {msg.messageType === "IMAGE" && (
                  <img
                    src={msg.fileUrl}
                    alt="img"
                    style={{
                      maxWidth: "200px",
                      borderRadius: 8,
                    }}
                  />
                )}

                {/* FILE MESSAGE */}

                {msg.messageType === "FILE" && (
                  <a
                    href={getDownloadUrl(msg.fileUrl, msg.fileName)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    📎 {msg.fileName}
                  </a>
                )}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}

      <div
        style={{
          display: "flex",
          padding: 10,
          borderTop: "1px solid #eee",
          gap: 8,
        }}
      >
        {/* FILE UPLOAD */}

        <label style={{ cursor: "pointer" }}>
          <UploadOutlined style={{ fontSize: 20 }} />
          <input
            type="file"
            style={{ display: "none" }}
            onChange={handleUpload}
          />
        </label>

        <Input
          value={content}
          placeholder="Nhập tin nhắn..."
          onChange={(e) => setContent(e.target.value)}
          onPressEnter={sendMessage}
        />

        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={sendMessage}
          loading={uploading}
        >
          Gửi
        </Button>
      </div>
    </div>
  );
}
