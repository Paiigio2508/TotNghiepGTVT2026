
import { request } from "./axios";
export class StudentAPI {
  static getAll = () => {
    return request.get("api/admin/student");
  };
  static createStudent = (data) => {
    return request.post("/api/admin/student", data);
  };
  static updateStudent = (id, data) => {
    return request.put(`/api/admin/student/${id}`, data);
  };
  static deleteStudent = (id) => {
    return request.put(`/api/admin/student/updateTT/${id}`);
  };
  static importStudent = (formData) => {
  return request.post(
    "/api/admin/student/import",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};
}
