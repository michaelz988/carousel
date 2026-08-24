const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.user;

const JWT_SECRET = process.env.JWT_SECRET || "code4real-secret-key";

const verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    req.userId = decoded.id;
    next();
  });
};

const isAdmin = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "admin") {
          next();
          return;
        }
      }

      res.status(403).send({
        message: "Require Admin Role!"
      });
      return;
    });
  });
};

const isTeacher = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "teacher") {
          next();
          return;
        }
      }

      res.status(403).send({
        message: "Require Teacher Role!"
      });
    });
  });
};

const isStudent = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "student") {
          next();
          return;
        }
      }

      res.status(403).send({
        message: "Require Student Role!"
      });
    });
  });
};

const isTeacherOrStudent = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "teacher" || roles[i].name === "student") {
          next();
          return;
        }
      }

      res.status(403).send({
        message: "Require Teacher Role!"
      });
    });
  });
};

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
  isTeacher: isTeacher,
  isTeacherOrStudent: isTeacherOrStudent,
  isStudent: isStudent
};
module.exports = authJwt;
