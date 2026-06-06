import { request } from "./axios";

export class FinalReportAPI {
  static submitFinalReport = (formData) => {
    return request.post("/api/final-reports/submit", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  };

  static getByAdvisorAssignmentId = (advisorAssignmentId) => {
    return request.get(
      `/api/final-reports/advisor-assignment/${advisorAssignmentId}`
    );
  };

  static getByTerm = (termId) => {
    return request.get(`/api/final-reports/term/${termId}`);
  };

static getByTeacherUserAndTerm = (userId, termId) => {
  return request.get(`/api/final-reports/teacher-user/${userId}/term/${termId}`);
};

  static requestRevision = (id, data) => {
    return request.put(`/api/final-reports/${id}/request-revision`, data);
  };

  static teacherApprove = (id) => {
    return request.put(`/api/final-reports/${id}/teacher-approve`);
  };

  static adminApprove = (id) => {
    return request.put(`/api/final-reports/${id}/admin-approve`);
  };

  static grade = (id, data) => {
    return request.put(`/api/final-reports/${id}/grade`, data);
  };
}