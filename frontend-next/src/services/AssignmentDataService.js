import http from "./http-common";

class StudentAssignmentDataService {
  getAll() {
    return http.get("/student/assignments");
  }

  get(id) {
    return http.get(`/assignments/${id}`);
  }

  create(data) {
    return http.post("/assignments", data);
  }

  update(id, data) {
    return http.put(`/assignments/${id}`, data);
  }

  delete(id) {
    return http.delete(`/assignments/${id}`);
  }

  deleteAll() {
    return http.delete(`/assignments`);
  }

  findByTitle(title) {
    return http.get(`/assignments?title=${title}`);
  }
}

export default new StudentAssignmentDataService();
