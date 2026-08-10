import http from "./http-common";

class PoasDataService {
  getAll(assignmentId, student) {
    if (student) {
      return http.get(`/poases?assignment=${assignmentId}&student=${student}`);
    } else {
      return http.get(`/poases?assignment=${assignmentId}`);
    }
  }

  getAssigned(assignmentId, student) {
    if (student) {
      return http.get(`/poases?assignment=${assignmentId}&assigned=1&student=${student}`);
    } else {
      return http.get(`/poases?assignment=${assignmentId}&assigned=1`);
    }
  }

  get(id) {
    return http.get(`/poases${id}`);
  }

  create(assignmentId, data) {
    return http.post(`/poases?assignment=${assignmentId}`, data);
  }

  update(id, data) {
    return http.put(`/poases${id}`, data);
  }

  delete(id) {
    return http.delete(`/poases${id}`);
  }

  deleteAll() {
    return http.delete(`/poases`);
  }

}

export default new PoasDataService();
