import http from "./http-common";

// Read-only views of every assignment, for admins.
class AdminDataService {
  getAll() {
    return http.get("/admin/assignments");
  }

  get(id) {
    return http.get(`/admin/assignments/${id}`);
  }

  getAssignmentTeachers(id) {
    return http.get(`/admin/assignments/${id}/teachers`);
  }

  showLottery(assignmentId) {
    return http.get(`/admin/lottery?assignment=${assignmentId}`);
  }
}

export default new AdminDataService();
