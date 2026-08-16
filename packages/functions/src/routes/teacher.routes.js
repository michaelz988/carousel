const express = require("express");
const { authJwt } = require("@carousel/core/src/middleware");
const controller = require("../controllers/teacher.controller");
const student = require("../controllers/student.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
    next();
  });

  const router = express.Router();

  router.get("/assignments", controller.findAllAssignments);
  router.get("/assignments/:id", controller.findOneAssignment);
  router.post("/lottery/lock", controller.lockLottery);
  router.delete("/lottery/lock", controller.unlockLottery);
  router.post("/lottery", controller.runLottery);
  router.put("/lottery", controller.runLottery);
  router.get("/lottery", controller.showLottery);
  router.get("/students", student.findAll);

  app.use("/api/teacher", authJwt.verifyToken, authJwt.isTeacher, router);

  app.post("/api/teacher/signup", [authJwt.verifyToken, authJwt.isAdmin], controller.signup);
  app.post("/api/teacher/signin", controller.signin);
};
