const db = require("@carousel/core");
const User = db.user;
const UserAssignments = db.user_assignments;
const Assignment = db.assignment;
const Lottery = db.lottery;
const Poas = db.poas;
const poasController = require("./poas.controller");
const paController = require("./poas_assignment.controller");

exports.create = async (req, res) => {
  let uid = req.userId;
  let studentId = 0;
  const assignmentId = parseInt(req.query.assignment);

  const lotteries = req.body;

  if (req.query.student) {
    studentId = parseInt(req.query.student);
  } else {
    studentId = uid;
  }

  try {
    const assignment = await Assignment.findByPk(assignmentId);
    let user_assignment = await UserAssignments.findOne({where: {studentId: studentId, assignmentId: assignmentId}});
    const poas = await user_assignment.getPoa();
    const user = await User.findByPk(uid);
    let isTeacher = false;

    const roles = await user.getRoles();
    for (let i = 0; i < roles.length; i++) {
       if (roles[i].name === "teacher") {
         isTeacher = true;
         break;
       }
    }
    if (!isTeacher && assignment.state != 0 && !((assignment.state == 2) && !poas) ) {
      res.status(403).send({ message: "Lottery entry is locked." });
      return;
    }

    let old_lotteries = await user_assignment.getLotteries();
    for (let entry of old_lotteries) {
      let poas = await poasController.findOrCreate(entry.name);
      await paController.delLottery(assignmentId, poas, entry.preference, entry);
      await entry.destroy({ force: true });
    };
    await user_assignment.setPoa(null);
    user_assignment.preferenceChosen = 0;
    await user_assignment.save();

    let new_lotteries = [];

    for (let i = 0; i < lotteries.length; i++) {
      const entry = lotteries[i];
      entry.preference = i + 1;
      let poas = await poasController.findOrCreate(entry.name);
      entry.wikiPageID = poas.wikiPageID;
      entry.wikiLink = poas.wikiLink;
      entry.wikiDescription = poas.wikiDescription;
      let lottery = await Lottery.create(entry);
      await poas.addLottery(lottery.id);
      await paController.addLottery(assignmentId, poas, entry.preference, lottery);
      await user_assignment.addLottery(lottery.id);
      await poas.save();
      await user_assignment.save();
      lottery.assigned = 0;
      await lottery.save();
      new_lotteries.push(lottery);
    };
    res.status(200).send(new_lotteries);
  } catch(err) {
    console.log(err);
    res.status(500).send({
      message: err.message || "Some error occurred while creating the Lottery."
    });
  }
};

exports.findAll = async (req, res) => {
  let uid = req.userId;
  const assignmentId = parseInt(req.query.assignment);

  if (req.query.student) {
    uid = parseInt(req.query.student);
  }

  try {
    let user_assignment = await UserAssignments.findOne({where: {studentId: uid, assignmentId: assignmentId}});

    let lotteries = await user_assignment.getLotteries({
      order: [['preference', 'ASC']]
    });
    let poasList = [];
    for (lottery of lotteries) {
      let poas = await Poas.findByPk(lottery.poaId);
      poasList.push(poas.id);
      lottery.name = poas.name;
      lottery.wikiPageID = poas.wikiPageID;
      lottery.wikiLink = poas.wikiLink;
      lottery.wikiDescription = poas.wikiDescription;
    }

    let poasStats = await poasController.getCounts(uid, assignmentId, poasList);
    res.send({lotteries: lotteries, poasStats: poasStats, poasAssigned: user_assignment.preferenceChosen});
  } catch(err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving Assignments."
    });
  }
};

exports.findOne = (req, res) => {
  const id = req.params.id;
  Lottery.findByPk(id)
    .then(data => { res.send(data); })
    .catch(err => {
      res.status(500).send({ message: "Error retrieving Lottery with id=" + id });
    });
};

exports.update = (req, res) => {
  const id = req.params.id;
  Lottery.update(req.body, { where: { id: id } })
    .then(num => {
      if (num == 1) {
        res.send({ message: "Lottery was updated successfully." });
      } else {
        res.send({ message: `Cannot update Lottery with id=${id}. Maybe Lottery was not found or req.body is empty!` });
      }
    })
    .catch(err => {
      res.status(500).send({ message: "Error updating Lottery with id=" + id });
    });
};

exports.delete = (req, res) => {
  const id = req.params.id;
  Lottery.destroy({ where: { id: id } })
    .then(num => {
      if (num == 1) {
        res.send({ message: "Lottery was deleted successfully!" });
      } else {
        res.send({ message: `Cannot delete Lottery with id=${id}. Maybe Lottery was not found!` });
      }
    })
    .catch(err => {
      res.status(500).send({ message: "Could not delete Lottery with id=" + id });
    });
};

exports.deleteAll = async (req, res) => {
  const uid = req.userId;
  const assignmentId = parseInt(req.query.assignment);

  try {
    user_assignment = await UserAssignments.findOne({where: {userId: uid, assignmentId: assignmentId}});
    let lotteries = await user_assignment.getLotteries();
    lotteries.forEach((entry, index) => {
      entry.destroy();
    });

    res.send({ message: `${lotteries.length} Lotteries were deleted successfully!` });
  } catch(err) {
    res.status(500).send({
      message: err.message || "Some error occurred while removing all lotteries."
    });
  };
};
