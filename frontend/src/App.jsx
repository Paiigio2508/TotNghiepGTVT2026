import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentManage from "./pages/admin/StudentManage";
import TeacherManage from "./pages/admin/TeacherManage";
import HocKyManage from "./pages/admin/HocKyManage";
import NotFoud from "./pages/404/NotFoud";
import PhanCongManage from "./pages/admin/PhanCongManage";
import LoginPage from "./pages/LoginPage";
import "bootstrap/dist/css/bootstrap.min.css";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<StudentManage />} />
          <Route path="teachers" element={<TeacherManage />} />
          <Route path="hoc-ky" element={<HocKyManage />} />
          <Route path="phan-cong" element={<PhanCongManage />} />
        </Route>

        <Route path="*" element={<NotFoud />} />
      </Routes>
    </BrowserRouter>
  );
}
