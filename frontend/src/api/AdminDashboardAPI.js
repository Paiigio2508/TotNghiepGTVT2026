import { request } from "./axios";

export class AdminDashboardAPI {

  static getDashboard = (termId) => {
    return request.get("/api/admin/dashboard", {
      params: { termId },
    });
  };
}