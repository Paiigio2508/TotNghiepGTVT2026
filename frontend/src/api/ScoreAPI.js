import { request } from "./axios";
export class ScoreAPI {
  static create = (data) => {
    return request.post("api/teacher/scores",data);
  };

}
