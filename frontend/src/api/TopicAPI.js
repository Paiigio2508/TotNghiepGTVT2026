import { request } from "./axios";

export class TopicAPI {
  // Lấy danh sách đề tài của sinh viên
  static getByStudent = (userId) => {
    return request.get(`/api/student/topic/${userId}`);
  };

  // Tạo đề tài
  static create = (userId, data) => {
    return request.post(`/api/student/topic/${userId}`, data);
  };

  // Cập nhật đề tài
  static update = (topicId, userId, data) => {
    return request.put(`/api/student/topic/${topicId}/${userId}`, data);
  };

  // Hủy đề tài
  static cancel = (topicId, userId) => {
    return request.put(`/api/student/topic/cancel/${topicId}/${userId}`);
  };
}
