import http from "./http-common";

class UploadFileService {
  upload(file, assignmentId, classPeriod, onUploadProgress) {
    let formData = new FormData();

    formData.append("file", file);

    return http.post(`/upload/?assignment=${assignmentId}&period=${classPeriod}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      },
      onUploadProgress
    });
  }

  getFiles() {
    return http.get("/files");
  }
}

export default new UploadFileService();