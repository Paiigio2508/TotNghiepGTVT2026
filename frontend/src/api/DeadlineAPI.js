import { request } from "./axios";

export class DeadlineAPI {
  static getAll = (termId, userId) => {
    return request.get(`/api/teacher/dealines/${termId}/${userId}`);
  };

  static createDeadline = (data, userId) => {
    return request.post(`/api/teacher/dealines/${userId}`, data);
  };

  static updateDeadline = (id, data, userId) => {
    return request.put(`/api/teacher/dealines/${id}/${userId}`, data);
  };
  static getByStudent = (userId) => {
    return request.get(`/api/student/deadlines/${userId}`);
  };
  static getDeadlineDetailForStudent = (deadlineId, userId) => {
    return request.get(`/api/student/deadlines/${deadlineId}/${userId}`);
  };
}
