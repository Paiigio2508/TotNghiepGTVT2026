import { request } from "./axios";
export class TermAPI {
  static getAll = () => {
    return request.get("/api/admin/internship-terms");
  };
  static create = (data) => {
    return request.post("/api/admin/internship-terms", data);
  };
  static update = (id, data) => {
    return request.put(`/api/admin/internship-terms/${id}`, data);
  };

  static getAllTermForTeacherLayout = () => {
    return request.get("/api/teacher/internship-terms");
  };
  static getinternshipsStudent = (studentId) => {
    return request.get(`/api/student/internships/${studentId}`);
  };
}
