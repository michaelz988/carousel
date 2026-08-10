import http from "./http-plain";

class AuthService {
  signin(token) {
    return http.post("/auth/signin", token)
  }
}

export default new AuthService()