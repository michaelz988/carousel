import http from "./http-common";

class UserDataService {
  update(data) {
    return http.update("/user", data);
  }
}

export default new UserDataService()