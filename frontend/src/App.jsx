import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminLayout from "./layouts/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentManage from "./pages/admin/StudentManage";
import TeacherManage from "./pages/admin/TeacherManage";
import HocKyManage from "./pages/admin/HocKyManage";
import PhanCongManage from "./pages/admin/PhanCongManage";

import TeacherLayout from "./layouts/TeacherLayout";

import LoginPage from "./pages/LoginPage";
import NotFoud from "./pages/404/NotFoud";
import RequireRole from "./guard/RequireRole";
import StudentList from "./pages/student/StudentList";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Trang mặc định */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Login luôn render bình thường */}
          <Route path="/login" element={<LoginPage />} />

          {/* ================= ADMIN ================= */}
          <Route element={<RequireRole roles={["ADMIN"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<StudentManage />} />
              <Route path="teachers" element={<TeacherManage />} />
              <Route path="hoc-ky" element={<HocKyManage />} />
              <Route path="assignments/:termId" element={<PhanCongManage />} />
            </Route>
          </Route>

          {/* ================= TEACHER ================= */}
          <Route element={<RequireRole roles={["GIANGVIEN"]} />}>
            <Route path="/teacher" element={<TeacherLayout />}>
              <Route path="students" element={<StudentList />} />
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
