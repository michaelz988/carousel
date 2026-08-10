import http from "./http-common";

class LotteryDataService {
  getAll(assignmentId, student) {
    if (student) {
      return http.get(`/lotteries?assignment=${assignmentId}&student=${student}`);
    } else {
      return http.get(`/lotteries?assignment=${assignmentId}`);
    }
  }

  get(id) {
    return http.get(`/lotteries/${id}`);
  }

  create(assignmentId, data, student) {
    if (student) {
      return http.post(`/lotteries?assignment=${assignmentId}&student=${student}`, data);
    } else {
      return http.post(`/lotteries?assignment=${assignmentId}`, data);
    }
  }

  update(id, data) {
    return http.put(`/lotteries/${id}`, data);
  }

  delete(id) {
    return http.delete(`/lotteries/${id}`);
  }

  deleteAll() {
    return http.delete(`/lotteries`);
  }

  findByTitle(title) {
    return http.get(`/lotteries?title=${title}`);
  }
}

export default new LotteryDataService();
