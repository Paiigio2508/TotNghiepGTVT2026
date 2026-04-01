import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginPage from "./pages/LoginPage";
import NotFoud from "./pages/404/NotFoud";
import RequireRole from "./guard/RequireRole";
//layout admin
import AdminLayout from "./layouts/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentManage from "./pages/admin/StudentManage";
import TeacherManage from "./pages/admin/TeacherManage";
import HocKyManage from "./pages/admin/HocKyManage";
import PhanCongManage from "./pages/admin/PhanCongManage";
import TopicManageAdmin from "./pages/admin/TopicManage";
//layout giảng viên
import TeacherLayout from "./layouts/TeacherLayout";
import StudentList from "./pages/teacher/StudentList";



// layout sinh viên
import StudentLayout from "./layouts/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import TopicManage from "./pages/teacher/TopicManage";
import TopicRegister from "./pages/student/TopicRegister";
import DeadlineManage from "./pages/teacher/DeadLineMange";
import StudentDeadlineList from "./pages/student/StudentDeadlineList";
import StudentDeadlineDetail from "./pages/student/StudentDeadlineDetail";
import DeadlineReports from "./pages/teacher/DeadlineReports";
import TeacherChatPage from "./pages/teacher/TeacherChatPage";
import StudentScore from "./pages/student/StudentScore";
import TeacherScore from "./pages/teacher/TeacherScore";
import AdminStudentScore from "./pages/admin/AdminStudentScore";
import AdminSpecialization from "./pages/admin/AdminSpecialization";
import TeacherSpecialization from "./pages/teacher/TeacherSpecialization";

export default function App() {
  return (
    <>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          {/* ================= ADMIN ================= */}
          <Route element={<RequireRole roles={["ADMIN"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="specialization" element={<AdminSpecialization />} />
              <Route path="students" element={<StudentManage />} />
              <Route path="teachers" element={<TeacherManage />} />
              <Route path="hoc-ky" element={<HocKyManage />} />
              <Route path="assignments/:termId" element={<PhanCongManage />} />
              <Route path="topic" element={<TopicManageAdmin />} />
              <Route path="scores" element={<AdminStudentScore />} />
            </Route>
          </Route>

          {/* ================= TEACHER ================= */}
          <Route element={<RequireRole roles={["GIANGVIEN"]} />}>
            <Route path="/teacher" element={<TeacherLayout />}>
              <Route path="specialization" element={<TeacherSpecialization />} />
              <Route path="students" element={<StudentList />} />
              <Route path="topics" element={<TopicManage />} />
              <Route path="deadlines" element={<DeadlineManage />} />
              <Route
                path="/teacher/deadline/:deadlineId/reports"
                element={<DeadlineReports />}
              />
              <Route path="scores" element={<TeacherScore />} />
              <Route path="chats" element={<TeacherChatPage />} />
            </Route>
          </Route>
          <Route element={<RequireRole roles={["SINHVIEN"]} />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<StudentDashboard />} />
              <Route path="topic" element={<TopicRegister />} />
              <Route path="deadlines" element={<StudentDeadlineList />} />
              <Route
                path="deadlines/:deadlineId"
                element={<StudentDeadlineDetail />}
              />
              <Route path="scores" element={<StudentScore />} />
            </Route>
          </Route>
          {/* 404 */}
          <Route path="*" element={<NotFoud />} />
        </Routes>
      </BrowserRouter>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
