import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;

export const connectSocket = (roomId, onMessageReceived) => {
  const socket = new SockJS("http://localhost:8080/ws");

  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
  });

  stompClient.onConnect = () => {
    console.log("Socket connected");

    stompClient.subscribe(`/topic/room/${roomId}`, (message) => {
      const body = JSON.parse(message.body);
      onMessageReceived(body);
    });
  };

  stompClient.activate();
};

export const sendMessage = (roomId, message) => {
  if (!stompClient || !stompClient.connected) return;

  stompClient.publish({
    destination: "/app/chat.sendMessage",
    body: JSON.stringify(message),
  });
};

export const disconnectSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
  }
};
