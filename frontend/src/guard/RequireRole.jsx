import { Navigate, Outlet } from "react-router-dom";
import { useRef } from "react";

export default function RequireRole({ roles }) {
  const hasAlerted = useRef(false);
  const userData = JSON.parse(localStorage.getItem("userData"));

  const roleRouteMap = {
    ADMIN: "/admin",
    GIANGVIEN: "/teacher",
    SINHVIEN: "/student",
  };

  // Chưa login
  if (!userData) {
    if (!hasAlerted.current) {
      alert("Vui lòng đăng nhập!");
      hasAlerted.current = true;
    }
    return <Navigate to="/login" replace />;
  }

  // Sai quyền
  if (!roles.includes(userData.role)) {
    if (!hasAlerted.current) {
      alert("Bạn không có quyền truy cập!");
      hasAlerted.current = true;
    }

    return <Navigate to={roleRouteMap[userData.role] || "/login"} replace />;
  }

  return <Outlet />;
}
