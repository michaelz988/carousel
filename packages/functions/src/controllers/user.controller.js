const db = require("@carousel/core");
const User = db.users;
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
  if (!req.body.gid) {
    res.status(400).send({ message: "User cannot be empty!" });
    return;
  }

  const user = {
    gid: req.body.gid,
    fname: req.body.fname,
    lname: req.body.lname
  };

  User.create(user)
    .then(data => { res.send(data); })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error user."
      });
    });
};

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.studentBoard = (req, res) => {
  res.status(200).send("Student Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.teacherBoard = (req, res) => {
  res.status(200).send("Teacher Content.");
};
