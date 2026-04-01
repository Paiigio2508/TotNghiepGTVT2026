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
  static getAllTeacher = () => {
    return request.get("/api/teacher/specialization");
  };
}
