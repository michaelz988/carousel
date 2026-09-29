const db = require("@carousel/core");
const User = db.user;
const Role = db.role;
const Assignment = db.assignment;
const UserAssignment = db.user_assignments;
const Lottery = db.lottery;
const Poas = db.poas;
const addrs = require("email-addresses");
const common = require("@carousel/core/src/util/common")
const sharing = require("./assignment_teachers.controller");

const Op = db.Sequelize.Op;

var bcrypt = require("bcryptjs");

exports.findAll = async (req, res) => {
  const uid = req.userId;
  const schoolId = parseInt(req.query.school);

  try {
    // Select teachers through the role rather than filtering every user, and
    // return only what the admin list needs -- never password or gid.
    const role = await Role.findOne({ where: { name: 'teacher' } });
    const teachers = await role.getUsers({
      attributes: ['userId', 'firstName', 'lastName', 'username', 'email'],
      joinTableAttributes: []
    });
    res.send(teachers);
  } catch(err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving teachers."
    });
  }
};

// Remove a single teacher.
exports.deleteOne = async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (!id) {
    return res.status(400).send({ message: "A teacher id is required." });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send({ message: "Teacher not found." });
    }

    // The id comes from the client, so confirm the target really is a teacher.
    // Without this check the route would delete any account by id, including
    // students and other admins.
    const roles = await user.getRoles();
    if (!roles.some(r => r.name === "teacher")) {
      return res
        .status(400)
        .send({ message: "That account is not a teacher." });
    }

    // Removing the account would orphan shared assignments and strip students
    // of their sections, so it waits until neither applies.
    const blocker = await sharing.removalBlocker(user);
    if (blocker) {
      return res.status(409).send({ message: blocker });
    }

    await sharing.releaseTeacher(user);
    await user.destroy();
    res.send({ id: id });
  } catch(err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while removing the teacher."
    });
  }
};

exports.deleteAll = async (req, res) => {
  const uid = req.userId;
  const schoolId = parseInt(req.query.school);

  try {
    const role = await Role.findOne({ where: { name: 'teacher' } });
    const teachers = await role.getUsers();

    // All or nothing: nobody is removed while any one of them is blocked.
    for (const teacher of teachers) {
      const blocker = await sharing.removalBlocker(teacher);
      if (blocker) {
        return res.status(409).send({
          message: `No teachers were removed. ${blocker}`
        });
      }
    }

    for (const teacher of teachers) {
      await sharing.releaseTeacher(teacher);
      await teacher.destroy();
    }
    res.send(null);
  } catch(err) {
    res.status(500).send({
      message: err.message || "Some error occurred while deleting teachers."
    });
  }
};

exports.create = async (req, res) => {
  const uid = req.userId;
  const schoolId = parseInt(req.query.school);

  try {
    let email = addrs.parseOneAddress(req.body.email);
    const [ user, created ] = await User.findOrCreate({
      where: { email: email.address },
      defaults: {
        username: email.local,
        email: email.address
      }
    });

    // A new teacher starts with no assignments: they create their own, or
    // an owner shares one with them.
    if (created) {
      await user.setRoles([2]);
      return res.send(user);
    }

    // An existing account is promoted rather than ignored -- this is how a
    // student, or an account that ended up with no role, becomes a teacher.
    const roles = (await user.getRoles()).map(r => r.name);
    if (roles.includes("teacher")) {
      return res.send(null);  // already a teacher
    }
    if (roles.includes("admin")) {
      return res.status(409).send({
        message: "That account is an admin and cannot also be a teacher."
      });
    }
    await user.setRoles([2]);
    res.send(user);
  } catch(err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating a teacher."
    });
  }
};

exports.findAllAssignments = (req, res) => {
  const uid = req.userId;

  User.findByPk(uid)
    .then(user => {
      user.getAssignment().then(data => {
        res.send(data);
      })
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Assignments."
      });
    });
};

exports.findOneAssignment = (req, res) => {
  const id = req.params.id;

  Assignment.findByPk(id)
    .then(data => { res.send(data); })
    .catch(err => {
      res.status(500).send({ message: "Error retrieving Assignment with id=" + id });
    });
};

async function resetLottery(assignment) {
  let studentAssignments = await assignment.getStudentAssignments();
  for (let studentAssignment of studentAssignments) {
    const lotteries = await studentAssignment.getLotteries();
    for (let index = 0; index < lotteries.length; index++) {
      const lottery = lotteries[index];
      lottery.assigned = 0;
      await lottery.save();
    }
    await studentAssignment.setPoa(null);
    studentAssignment.sequence = 0;
    studentAssignment.preferenceChosen = 0;
    await studentAssignment.save();
  }
  return studentAssignments;
};

exports.runLottery = async (req, res) => {
  const uid = req.userId;
  const assignmentId = parseInt(req.query.assignment);

  try {
    let assignment = await Assignment.findByPk(assignmentId);
    let studentAssignments = [];

    if (req.method == 'POST') {
      studentAssignments = await resetLottery(assignment);
      for (let i = 0; i < 3; i++) {
        common.shuffleOnce(studentAssignments);
      }
      for (const [index, studentAssignment] of studentAssignments.entries()) {
        studentAssignment.sequence = index + 1;
        await studentAssignment.save();
      }
    } else {
      studentAssignments = await assignment.getStudentAssignments({
        order: [['sequence', 'ASC']]
      });
    }

    let isCompleted = true;
    for (let index = 0; index < studentAssignments.length; index++) {
      let studentAssignment = studentAssignments[index];
      let assigned = studentAssignment.preferenceChosen;
      if (assigned) continue;

      let lotteries = await studentAssignment.getLotteries({
        order: [['preference', 'ASC']]
      });
      for (let index2 = 0; index2 < lotteries.length; index2++) {
        let lottery = lotteries[index2];
        let poas = await lottery.getPoa();
        if (!poas.userAssignmentId) {
          assigned = index2 + 1;
          await studentAssignment.setPoa(poas.id);
          studentAssignment.preferenceChosen = index2 + 1;
          lottery.assigned = studentAssignment.preferenceChosen;
          await studentAssignment.save();
          await lottery.save();
          console.log("Assign student: ", studentAssignment.studentId, " to POAS: ", poas.id)
          break;
        }
      }
      if (!assigned) {
        isCompleted = false;
        console.log("Unable to assign student: ", studentAssignment.studentId);
      }
    }

    if (isCompleted) assignment.state = 3;
    else assignment.state = 2;
    await assignment.save();
    res.send(assignment);
  } catch(err) {
    res.status(500).send({
      message: err.message || "Some error occurred while conducting lottery."
    });
  }
};

exports.lockLottery = async (req, res) => {
  const assignmentId = parseInt(req.query.assignment);
  let assignment = await Assignment.findByPk(assignmentId);
  if (assignment.state > 0) {
    console.log("Lottery already locked");
    res.status(409).send({message: "Lottery already locked!"});
    return;
  }
  assignment.state = 1;
  await assignment.save();
  res.send(assignment);
};

exports.unlockLottery = async (req, res) => {
  const assignmentId = parseInt(req.query.assignment);
  let assignment = await Assignment.findByPk(assignmentId);
  await resetLottery(assignment);
  if (assignment.state == 0) {
    console.log("Lottery already unlocked");
    res.status(200).send({message: "Lottery already unlocked!"});
    return;
  }
  assignment.state = 0;
  await assignment.save();
  res.send(assignment);
};

exports.showLottery = async (req, res) => {
  const uid = req.userId;
  const assignmentId = parseInt(req.query.assignment);
  const assignment = await Assignment.findByPk(assignmentId);

  try {
    let userAssignments = await assignment.getStudentAssignments({
      order: [['sequence', 'ASC']],
      include: [
        { model: Poas },
        { model: Lottery, as: 'lotteries' },
        { model: User, as: 'Student' },
        { model: UserAssignment, as: 'ClassTeacher', include: [{ model: User, as: 'Teacher' }] }
      ]
    });
    res.send(userAssignments);
  } catch(err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving lottery result."
    });
  }
};

exports.addStudent = async (req, res) => {};

exports.signup = (req, res) => {
  User.findOrCreate({ where: { email: req.body.email } })
    .then(result => {
      user = result[0];
      Role.findOne({ where: { name: "teacher" } }).then(role => {
        user.addRoles(role).then(() => {
          res.send({ message: "Teacher was registered successfully!" });
        });
      })
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};
