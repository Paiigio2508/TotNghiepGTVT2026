import { request } from "./axios";

export class TeacherDashboardAPI {
  static layThongKeDashboard = (idKy) => {
    return request.get("/api/teacher/dashboard", {
      params: {
        idKy,
      },
    });
  };
}