const express = require("express");
const router = express.Router();
const controller = require("../controllers/file.controller");
const { authJwt } = require("@carousel/core/src/middleware");

let routes = (app) => {
  router.post("/api/upload", authJwt.verifyToken, authJwt.isTeacher, controller.upload);
  app.use(router);
};

module.exports = routes;
