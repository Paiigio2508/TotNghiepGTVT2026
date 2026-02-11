import { request } from "./axios";
export class TeacherAPI {
  static getAll = () => {
    return request.get("/api/admin/teacher");
  };
  static createTeacher = (data) => {
    return request.post("/api/admin/teacher", data);
  };
  static updateTeacher = (id, data) => {
    return request.put(`/api/admin/teacher/${id}`, data);
  };
  static deleteTeacher = (id) => {
    return request.put(`/api/admin/teacher/updateTT/${id}`);
  };
}
