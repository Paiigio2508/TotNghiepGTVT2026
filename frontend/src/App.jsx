
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import LoginPage from "./pages/LoginPage";
// import RequireAuth from "./guard/RequireAuth";
// import RequireRole from "./guard/RequireRole";
// import AdminLayout from "./layouts/admin/AdminLayout";
// import AdminDashboard from "./pages/admin/AdminDashboard";

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* public */}
//         <Route path="/" element={<Navigate to="/login" />} />
//         <Route path="/login" element={<LoginPage />} />

//         {/* admin */}
//         <Route element={<RequireAuth />}>
//           <Route element={<RequireRole roles={["ADMIN"]} />}>
//             <Route path="/admin" element={<AdminLayout />}>
//               <Route index element={<AdminDashboard />} />
//             </Route>
//           </Route>
//         </Route>

//         {/* fallback */}
//         <Route path="*" element={<h1>Not Found</h1>} />
//       </Routes>
//     </BrowserRouter>
//   );
// }
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
// import StudentManage from "./pages/admin/StudentManage";
// import TeacherManage from "./pages/admin/TeacherManage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* FIX TRANG TRẮNG */}
        <Route path="/" element={<Navigate to="/admin" />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          {/* <Route path="students" element={<StudentManage />} />
          <Route path="teachers" element={<TeacherManage />} /> */}
        </Route>

        {/* fallback */}
        <Route path="*" element={<h1>404</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
