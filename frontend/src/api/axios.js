import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // /api
  withCredentials: true, // nếu dùng cookie / session
});

// Gắn JWT tự động
api.interceptors.request.use(
  (config) => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const token = JSON.parse(userData).accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
