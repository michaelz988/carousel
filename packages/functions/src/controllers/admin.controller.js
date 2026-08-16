const db = require("@carousel/core");
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET || "code4real-secret-key";

exports.signin = (req, res) => {
  User.findOne({
    where: {
      email: req.body.email
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }

      Role.findOne({
        where: {
          name: "admin"
        }
      })
      .then(role => {
        user.hasRoles(role).then(found => {
          if (!found) {
            return res.status(404).send({ message: "Role does not match." });
          }

          var token = jwt.sign({ id: user.userId }, JWT_SECRET, {
            expiresIn: 86400 // 24 hours
          });

          res.status(200).send({
            id: user.userId,
            username: user.username,
            email: user.email,
            accessToken: token
          });
        })
      })
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};
