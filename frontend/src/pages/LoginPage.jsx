import { useState } from "react";
import "./LoginPage.css";
import logo from "../assets/logo_login.png";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-wrapper">
      <div className="login-box-wrapper">
        {/* LOGO NẰM TRÊN CARD */}
        <img src={logo} className="logo-top" alt="logo" />

        <div className="login-card">
          <h2 className="text-center">ĐĂNG NHẬP</h2>

          <div className="input-group">
            <span>👤</span>
            <input type="text" placeholder="Mã sinh viên" />
          </div>

          <div className="input-group">
            <span>🔑</span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
            />
            <button
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

          <button className="login-btn">ĐĂNG NHẬP</button>

          <div className="divider">Hoặc đăng nhập</div>

          <button className="ms-btn">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
              alt="ms"
            />
            Sign in using Microsoft
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
