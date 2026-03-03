import { useState } from "react";
import ChatBox from "./ChatBox";

function ChatWidget({ roomId }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Nút chat */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "#1976d2",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          fontSize: "24px",
          zIndex: 999,
        }}
      >
        💬
      </div>

      {/* Popup chat */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "350px",
            height: "450px",
            backgroundColor: "white",
            boxShadow: "0 0 10px rgba(0,0,0,0.3)",
            borderRadius: "10px",
            overflow: "hidden",
            zIndex: 999,
          }}
        >
          <ChatBox roomId={roomId} />
        </div>
      )}
    </>
  );
}

export default ChatWidget;
