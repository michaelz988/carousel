const { authJwt } = require("../middleware");
const assignments = require("../controllers/assignment.controller.js");
const router = require("express").Router();

module.exports = app => {
  // Create a new Assignment. Teacher-only: the router below admits students
  // too (they need to read assignments), so creation is gated separately.
  router.post("/", authJwt.isTeacher, assignments.create);

  // Find one assignement with id
  router.get("/:id", assignments.findOne);

  // Update a Assignment with id
  router.put("/:id", assignments.update);

  // Delete a Assignment with id
  router.delete("/:id", assignments.delete);

  // Delete all Assignments
  router.delete("/", assignments.deleteAll);

   app.use('/api/assignments', authJwt.verifyToken, authJwt.isTeacherOrStudent, router);
};
