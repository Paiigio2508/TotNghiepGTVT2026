import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;

export const connectSocket = (
  roomId,
  userId,
  onChatMessage,
  onNotification
) => {
  if (stompClient && stompClient.connected) {
    return;
  }

  const socket = new SockJS("http://localhost:8080/ws");

  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
  });

  stompClient.onConnect = () => {

    /* ================= CHAT ================= */

    if (roomId) {
      stompClient.subscribe(`/topic/room/${roomId}`, (message) => {
        const body = JSON.parse(message.body);

        if (onChatMessage) {
          onChatMessage(body);
        }
      });
    }

    /* ================= NOTIFICATION ================= */

    if (userId) {
      stompClient.subscribe(`/topic/notification/${userId}`, (message) => {
        const body = JSON.parse(message.body);

        if (onNotification) {
          onNotification(body);
        }
      });
    }
  };

  stompClient.activate();
};

export const disconnectSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
};
