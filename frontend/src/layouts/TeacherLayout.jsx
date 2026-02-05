import { Outlet } from "react-router-dom";

export default function TeacherLayout() {
  return (
    <>
      <h2>Teacher Panel</h2>
      <Outlet />
    </>
  );
}
