import { request } from "./axios";
export class SpecializationAPI {
  static getAll = () => {
    return request.get("/api/admin/specialization");
  };
  static createSpecialization = (data) => {
    return request.post("/api/admin/specialization", data);
  };
  static updateSpecialization = (id, data) => {
    return request.put(`/api/admin/specialization/${id}`, data);
  };
  static updateTT = (id) => {
    return request.put(`/api/admin/specialization/updateTT/${id}`);
  };
  static getAllStudent = () => {
    return request.get("/api/student/specialization");
  };

  // tbm phân
  static getAllSpecializtion = () => {
    return request.get("/api/head/specialization");
  };

  static getTeacherSpecializationTerm = (termId) => {
    return request.get(`/api/head/specialization/teacher-assignment/${termId}`);
  };

  static saveTeacherSpecializationTerm = (data) => {
    return request.post("/api/head/specialization/teacher-assignment", data);
  };

  static saveTeacherSpecializationTermBulk = (data) => {
    return request.post("/api/head/specialization/teacher-assignment/bulk", data);
  };
  static getTeacherSpecializationHistory = (termId) => {
    return request.get(`/api/head/specialization/teacher-assignment/history/${termId}`);
  };
static getStudentStats = () => {
  return request.get("/api/head/specialization/student-stat");
};
}
