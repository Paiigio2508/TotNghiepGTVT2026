import { request } from "./axios";
export class AssignmentsAPI {
  static getAllsvDuDK = (id) => {
    return request.get(`/api/admin/assignments/students/${id}`);
  };
  static getAllGV = (id) => {
    return request.get(`/api/admin/assignments/teachers/${id}`);
  };
  static autoAssign = (termId) => {
    return request.post(`/api/admin/assignments/auto/${termId}`);
  };
  static getAllsvAssigned = (id) => {
    return request.get(`/api/admin/assignments/assigned/${id}`);
  };
}
