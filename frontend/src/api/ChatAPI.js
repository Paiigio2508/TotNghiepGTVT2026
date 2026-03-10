import { request } from "./axios";
export class ChatAPI {
  static getRoomByStudent = (userId) => {
    return request.get(`/api/chat/student/${userId}`);
  };

  static getRoomByTeacher = (userId) => {
    return request.get(`/api/chat/teacher/${userId}`);
  };

  static getMessages = (roomId) => {
    return request.get(`/api/chat/${roomId}`);
  };
  static sendMessage = (data) => {
    return request.post("/api/chat/send", data);
  };
  static sendFile = (formData) => {
    return request.post("/api/chat/send-file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };
}
