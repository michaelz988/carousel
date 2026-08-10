import http from "./http-common";

class StudentDataService {
  getAll(assignmentId) {
    return http.get(`/teacher/students?assignment=${assignmentId}`);
  }

  get(id) {
    return http.get(`/student/${id}`);
  }

  create(data) {
    return http.post("/student", data);
  }

  update(id, data) {
    return http.put(`/student/${id}`, data);
  }

  delete(id) {
    return http.delete(`/student/${id}`);
  }

  deleteAll(assignmentId) {
    return http.delete(`/student?assignment=${assignmentId}`);
  }

  findByTitle(title) {
    return http.get(`/student?title=${title}`);
  }
}

export default new StudentDataService();