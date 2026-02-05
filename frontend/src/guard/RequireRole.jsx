import { Navigate, Outlet } from "react-router-dom";

export default function RequireRole({ roles }) {
  const userData = JSON.parse(localStorage.getItem("userData"));

  if (!userData || !roles.includes(userData.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
