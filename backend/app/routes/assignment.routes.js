const { authJwt } = require("../middleware");
const assignments = require("../controllers/assignment.controller.js");
const router = require("express").Router();

module.exports = app => {
  // Create a new Assignment. Teacher-only: the router below admits students
  // too (they need to read assignments), so creation is gated separately.
  router.post("/", authJwt.isTeacher, assignments.create);

  // Find one assignement with id
  router.get("/:id", assignments.findOne);

  // Teachers on the assignment only; see assignments.update.
  router.put("/:id", authJwt.isTeacher, assignments.update);

   app.use('/api/assignments', authJwt.verifyToken, authJwt.isTeacherOrStudent, router);
};
