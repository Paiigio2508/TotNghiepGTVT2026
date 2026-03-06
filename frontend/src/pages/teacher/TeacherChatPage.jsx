import { Layout, Avatar } from "antd";
import { useEffect, useState } from "react";

import ChatWidget from "../../components/ChatWidget";
import { ChatAPI } from "../../api/ChatAPI";

const { Sider, Content } = Layout;

export default function TeacherChatPage() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const userData = JSON.parse(localStorage.getItem("userData"));

  useEffect(() => {
    const fetchRooms = async () => {
      const res = await ChatAPI.getRoomByTeacher(userData.userId);
      setRooms(res.data || []);
    };

    fetchRooms();
  }, []);

  return (
    <Layout style={{ background: "#fff", height: "85vh" }}>
      {/* DANH SÁCH SINH VIÊN */}
      <Sider
        width={280}
        style={{ background: "#fff", borderRight: "1px solid #eee" }}
      >
        <div style={{ padding: 16, fontWeight: 600 }}>Tin nhắn sinh viên</div>

        {rooms.map((room) => (
          <div
            key={room.roomId}
            onClick={() => setSelectedRoom(room)}
            style={{
              display: "flex",
              gap: 10,
              padding: 12,
              cursor: "pointer",
              borderBottom: "1px solid #f0f0f0",
              background:
                selectedRoom?.roomId === room.roomId ? "#e6f4ff" : "#fff",
            }}
          >
            <Avatar>{room.studentName?.charAt(0)}</Avatar>

            <div>
              <div style={{ fontWeight: 600 }}>{room.studentName}</div>
              <div style={{ fontSize: 12, color: "#888" }}>
                {room.studentCode}
              </div>
            </div>
          </div>
        ))}
      </Sider>

      {/* CHAT */}
      <Content style={{ height: "100%" }}>
        {selectedRoom ? (
          <ChatWidget
            roomId={selectedRoom.roomId}
            studentName={selectedRoom.studentName}
            mode="page"
          />
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#999",
            }}
          >
            Chọn sinh viên để bắt đầu chat
          </div>
        )}
      </Content>
    </Layout>
  );
}
