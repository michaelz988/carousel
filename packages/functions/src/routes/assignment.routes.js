const { authJwt } = require("@carousel/core/src/middleware");
const assignments = require("../controllers/assignment.controller.js");
const router = require("express").Router();

module.exports = app => {
  router.post("/", assignments.create);
  router.get("/:id", assignments.findOne);
  router.put("/:id", assignments.update);
  router.delete("/:id", assignments.delete);
  router.delete("/", assignments.deleteAll);

  app.use('/api/assignments', authJwt.verifyToken, authJwt.isTeacherOrStudent, router);
};
