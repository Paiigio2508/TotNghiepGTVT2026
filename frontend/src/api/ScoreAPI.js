import { request } from "./axios";
export class ScoreAPI {
  static create = (data) => {
    return request.post("/api/teacher/scores", data);
  };
  static getScoreByStudent = (userId) => {
    return request.get(`/api/student/scores/${userId}`);
  };
  static getScoreStudentforTeacher = (userId, termId) => {
    return request.get(`/api/teacher/scores/${userId}/${termId}`);
  };
}
