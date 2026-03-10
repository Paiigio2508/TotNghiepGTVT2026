import axios from "axios";
const BASE_URL = "http://localhost:8080/api/notifications";
export const NotificationAPI = {
  getByUser(userId) {
    return axios.get(`${BASE_URL}/${userId}`);
  },
  countUnread(userId) {
    return axios.get(`${BASE_URL}/count/${userId}`);
  },
  markRead(id) {
    return axios.put(`${BASE_URL}/read/${id}`);
  },
};
