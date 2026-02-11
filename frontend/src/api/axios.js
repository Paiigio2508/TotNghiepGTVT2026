import axios from "axios";

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
    if (error.response?.status === 401) {
      localStorage.removeItem("userData");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
