import { Navigate, Outlet } from "react-router-dom";

export default function RequireAuth() {
  const userData = localStorage.getItem("userData");

  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
