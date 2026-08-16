const { authJwt } = require("@carousel/core/src/middleware");

module.exports = app => {
  const lotteries = require("../controllers/lottery.controller.js");
  var router = require("express").Router();

  router.post("/", lotteries.create);
  router.get("/", lotteries.findAll);
  router.get("/:id", lotteries.findOne);
  router.put("/:id", lotteries.update);
  router.delete("/:id", lotteries.delete);
  router.delete("/", lotteries.deleteAll);

  app.use('/api/lotteries', authJwt.verifyToken, authJwt.isTeacherOrStudent, router);
};
