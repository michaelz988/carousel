const { authJwt } = require("@carousel/core/src/middleware");
const assignments = require("../controllers/assignment.controller.js");
const router = require("express").Router();

module.exports = app => {
  // Teacher-only: the router below admits students too (they need to read
  // assignments), so creation is gated separately.
  router.post("/", authJwt.isTeacher, assignments.create);
  router.get("/:id", assignments.findOne);
  router.put("/:id", assignments.update);
  router.delete("/:id", assignments.delete);
  router.delete("/", assignments.deleteAll);

  app.use('/api/assignments', authJwt.verifyToken, authJwt.isTeacherOrStudent, router);
};
