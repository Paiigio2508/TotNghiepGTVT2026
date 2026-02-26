import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import logo from "../assets/logo_login.png";
import { AuthAPI } from "../api/AuthAPI";
import { toast } from "react-toastify";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // 🔥 Nếu đã login rồi thì tự redirect
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));

    if (userData) {
      const roleRoute = {
        ADMIN: "/admin",
        GIANGVIEN: "/teacher",
        SINHVIEN: "/student",
      };

      navigate(roleRoute[userData.role] || "/login", { replace: true });
    }
  }, [navigate]);

const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await AuthAPI.login({
      username,
      password,
    });

    const { accessToken, username: userName, role, avatar } = res.data;

    localStorage.setItem(
      "userData",
      JSON.stringify({
        accessToken,
        role,
        username: userName,
        avatar,
      })
    );

    toast.success("Đăng nhập thành công!");

    const roleRoute = {
      ADMIN: "/admin",
      GIANGVIEN: "/teacher",
      SINHVIEN: "/student",
    };
console.log("ROLE:", role);
console.log("FULL RESPONSE:", res.data);
    navigate(roleRoute[role] || "/login", { replace: true });
  } catch (error) {
    console.error(error);
    alert("Sai tài khoản hoặc mật khẩu");
  }
};

  return (
    <div className="login-wrapper">
      <div className="login-box-wrapper">
        <img src={logo} className="logo-top" alt="logo" />

        <form className="login-card" onSubmit={handleLogin}>
          <h2 className="text-center">ĐĂNG NHẬP</h2>

          <div className="input-group">
            <span>👤</span>
            <input
              type="text"
              placeholder="Mã đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <span>🔑</span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              👁
            </button>
          </div>

          <div className="links">
            <a href="#">Quên mật khẩu</a>
            <a href="#">Trợ giúp</a>
          </div>

          <button type="submit" className="login-btn">
            ĐĂNG NHẬP
          </button>

          <div className="divider">Hoặc đăng nhập</div>

          <button type="button" className="ms-btn">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
              alt="ms"
            />
            Sign in using Microsoft
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
