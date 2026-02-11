import { request } from "./axios";
export class AuthAPI {
  static login = (data) => {
    return request.post("/api/auth/login", data);
  };
}
