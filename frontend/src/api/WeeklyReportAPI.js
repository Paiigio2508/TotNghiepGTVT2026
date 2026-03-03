import { request } from "./axios";

export class WeeklyReportAPI {
  static submitWeeklyReport = (formData) => {
    return request.post("/api/student/reports", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  };
}
