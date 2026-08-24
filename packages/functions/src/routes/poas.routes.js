const { authJwt } = require("@carousel/core/src/middleware");

module.exports = app => {
  const poases = require("../controllers/poas.controller.js");
  var router = require("express").Router();

  router.post("/", poases.create);
  router.get("/", poases.findAll);

  app.use('/api/poases', authJwt.verifyToken, authJwt.isTeacherOrStudent, router);
};
