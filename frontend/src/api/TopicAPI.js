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
  static findTopicsByTeacherAndTerm = (userId, termId) => {
    return request.get(`/api/teacher/topic/${userId}/${termId}`);
  };
  static approveTopic = (topicId) => {
    return request.put(`/api/teacher/topic/${topicId}/approve`);
  };
  static rejectTopic = (topicId) => {
    return request.put(`/api/teacher/topic/${topicId}/reject`);
  };

  //admin
  static findTopicsByAdmin = (termId) => {
    return request.get(`/api/admin/topic/${termId}`);
  };
  static adminApproveTopic = (topicId) => {
    return request.put(`/api/admin/topic/${topicId}/approve`);
  };
}
