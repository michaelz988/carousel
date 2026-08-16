const { authJwt } = require("@carousel/core/src/middleware");
const controller = require("../controllers/user.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
    next();
  });

  app.get("/api/student", [authJwt.verifyToken, authJwt.isStudent], controller.studentBoard);
  app.get("/api/admin", [authJwt.verifyToken, authJwt.isAdmin], controller.adminBoard);

  var router = require("express").Router();
  router.post("/", controller.create);
  app.use('/api/user', router);
}
