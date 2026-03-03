import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  connectSocket,
  sendMessage,
  disconnectSocket,
} from "../socket/chatSocket";

export default function ChatBox({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const userData = JSON.parse(localStorage.getItem("userData"));

  // 🔥 Scroll xuống cuối
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 🔥 Load lịch sử chat
  useEffect(() => {
    if (!roomId) return;

    axios
      .get(`http://localhost:8080/api/chat/${roomId}`)
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.data)) {
          setMessages(res.data.data);
        } else {
          setMessages([]);
        }
      })
      .catch((err) => {
        console.error("Lỗi load lịch sử:", err);
        setMessages([]);
      });
  }, [roomId]);

  // 🔥 Kết nối WebSocket
  useEffect(() => {
    if (!roomId) return;

    connectSocket(roomId, (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      disconnectSocket();
    };
  }, [roomId]);

  // 🔥 Auto scroll
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const messageData = {
      roomId: roomId,
      senderId: userData?.userId,
      message: input,
    };

    sendMessage(roomId, messageData);
    setInput("");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#1976d2",
          color: "white",
          padding: "10px",
          fontWeight: "bold",
        }}
      >
        Chat
      </div>

      {/* Message list */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px",
          background: "#f5f5f5",
        }}
      >
        {messages.map((msg, index) => {
          // 🔥 FIX QUAN TRỌNG Ở ĐÂY
          const isMine =
            msg.senderId === userData?.userId ||
            msg.sender?.id === userData?.userId;

          return (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: isMine ? "flex-end" : "flex-start",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  background: isMine ? "#1976d2" : "white",
                  color: isMine ? "white" : "black",
                  padding: "8px 12px",
                  borderRadius: "12px",
                  maxWidth: "70%",
                  wordBreak: "break-word",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
              >
                {/* Tên người gửi */}
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    marginBottom: "4px",
                    opacity: 0.7,
                  }}
                >
                  {isMine ? "Bạn" : msg.sender?.name || "Người khác"}
                </div>

                {msg.message}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          display: "flex",
          padding: "10px",
          borderTop: "1px solid #ddd",
          background: "white",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Nhập tin nhắn..."
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={handleSend}
          style={{
            marginLeft: "8px",
            padding: "8px 12px",
            background: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
