import http from "./http-common";

class TeacherDataService {
  getAll() {
    return http.get("/teacher/assignments");
  }

  // ToDo: getAll needs to be moved to AssignmentDataService, getAllTeachers should use getAll
  getAllTeachers(id) {
    return http.get(`/admin/teacher?school=${id}`);
  }

  deleteTeacher(teacherId) {
    return http.delete(`/admin/teacher/${teacherId}`);
  }

  deleteAllTeachers(schoolId) {
    return http.delete(`/admin/teacher?school=${schoolId}`);
  }

  addTeacher(id, data) {
    return http.post(`/admin/teacher?school=${id}`, data);
  }

  get(id) {
    return http.get(`/teacher/assignments/${id}`);
  }

  create(data) {
    return http.post("/teacher/assignments", data);
  }

  update(id, data) {
    return http.put(`/teacher/assignments/${id}`, data);
  }

  delete(id) {
    return http.delete(`/teacher/assignments/${id}`);
  }

  deleteAll() {
    return http.delete(`/teacher/assignments`);
  }

  runLottery(assignmentId) {
    return http.post(`/teacher/lottery?assignment=${assignmentId}`);
  }

  resumeLottery(assignmentId) {
    return http.put(`/teacher/lottery?assignment=${assignmentId}`);
  }

  lockLottery(assignmentId) {
    return http.post(`/teacher/lottery/lock?assignment=${assignmentId}`);
  }

  unlockLottery(assignmentId) {
    return http.delete(`/teacher/lottery/lock?assignment=${assignmentId}`);
  }

  showLottery(assignmentId) {
    return http.get(`/teacher/lottery?assignment=${assignmentId}`);
  }

}

export default new TeacherDataService();
