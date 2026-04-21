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
  static getAllSpecializtion = () => {
    return request.get("/api/head/specialization");
  };
  static getTeacherSpecializationTerm = (termId) => {
    return request.get(`/api/head/specialization/term/${termId}`);
  };

  static saveTeacherSpecializationTerm = (data) => {
    return request.post("/api/head/specialization/term/save", data);
  };

  static saveTeacherSpecializationTermBulk = (data) => {
    return request.post("/api/head/specialization/term/save-bulk", data);
  };
}
