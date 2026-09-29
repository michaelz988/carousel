const express = require("express");
const { authJwt } = require("@carousel/core/src/middleware");
const teacherController = require("../controllers/teacher.controller");
const assignments = require("../controllers/assignment.controller");
const sharing = require("../controllers/assignment_teachers.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
    next();
  });

  const router = express.Router();
  router.get("/teacher", teacherController.findAll);
  router.post("/teacher", teacherController.create);
  router.delete("/teacher", teacherController.deleteAll);

  // Remove a single Teacher
  router.delete("/teacher/:id", teacherController.deleteOne);

  // Read-only view of every assignment, its teachers and its lottery result
  router.get("/assignments", assignments.findAll);
  router.get("/assignments/:id", assignments.findOne);
  router.get("/assignments/:id/teachers", sharing.listForAdmin);
  router.get("/lottery", teacherController.showLottery);

  app.use("/api/admin", authJwt.verifyToken, authJwt.isAdmin, router);
};
