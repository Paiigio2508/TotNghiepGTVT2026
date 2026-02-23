import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "http://localhost:8080";

/* ========================
   LẤY TOKEN
======================== */
const getAccessToken = () => {
  const userData = localStorage.getItem("userData");
  if (!userData) return null;

  try {
    return JSON.parse(userData).accessToken;
  } catch {
    return null;
  }
};

/* ========================
   AXIOS INSTANCE
======================== */
export const request = axios.create({
  baseURL: API_URL,
});

/* ========================
   REQUEST INTERCEPTOR
======================== */
request.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ========================
   RESPONSE INTERCEPTOR
======================== */
request.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem("userData");
      toast.error("Phiên đăng nhập đã hết hạn!");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (status === 409) {
      toast.error(error.response?.data || "Dữ liệu đã tồn tại!");
      return Promise.reject(error);   // 🔥 QUAN TRỌNG
    }

    if (status === 404) {
      toast.error("Không tìm thấy dữ liệu!");
      return Promise.reject(error);
    }

    if (status === 500) {
      toast.error("Lỗi hệ thống!");
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);