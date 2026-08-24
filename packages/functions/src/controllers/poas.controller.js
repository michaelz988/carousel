const db = require("@carousel/core");
const Op = db.Sequelize.Op;
const Assignment = db.assignment;
const UserAssignments = db.user_assignments;
const PoasAssignment = db.poas_assignment;
const Lottery = db.lottery;
const Poas = db.poas;
const wiki = require('wikijs').default;

exports.create = async (req, res) => {
  const uid = req.userId;
  const assignmentId = parseInt(req.query.assignment);
  const entry = req.body;

  try {
    user_assignment = await UserAssignments.findOne({where: {userId: uid, assignmentId: assignmentId}});
    let poas = await this.findOrCreate(entry.name);
    return poas;
  } catch(err) {
    console.log(err.message || "Some error occurred while creating the POAS.");
  }
};

exports.findOrCreate = async (name) => {
  try {
    const results = await wiki().page(name);
    const summary = await results.summary();
    const pDescription = summary.substring(0,125);
    const pName = results.title.trim();
    const pageID  = results.pageid;
    const pLink = results.fullurl;
    const pageProperties = results.pageprops;

    let poas = null;

    if (pName.includes("disambiguation") || pageProperties?.disambiguation !== undefined) {
      poas = await Poas.findByPk(2);
      return(poas);
    }

    let poases = await Poas.findAll({where: { wikiPageID: pageID }});
    const len = poases.length;

    for (let i = 0; i < len; i++) {
      p = poases[i];
      if (p.wikiPageID == pageID) {
        poas = p;
      }
    }

    if (poas == null) {
      poas = await Poas.create({
        name: pName,
        wikiPageID: pageID,
        wikiLink: pLink,
        wikiDescription: pDescription,
        count: 0
      });
    }

    return(poas);
  } catch(err) {
      console.log(err.message || "Some error occurred while getting a POAS.");
      if (err.message == "No article found") {
        let poas = await Poas.findByPk(1);
        return(poas);
      }
  }
};

exports.findAll = async (req, res) => {
  let uid = req.userId;
  const assignmentId = parseInt(req.query.assignment);

  if (req.query.student) {
    uid = parseInt(req.query.student);
  }

  try {
    let poasList = [];
    if (req.query.assigned) {
      poasList = await Poas.findAll({
        where: { userAssignmentId: { [Op.ne]: null } }
      })
    } else {
      poasList = await Poas.findAll();
    }
    res.send(poasList);
  } catch(err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving POAS list."
    });
  }
};

exports.getCounts = async (userId, assignmentId, poasList) => {
  let user_assignment = await UserAssignments.findOne({where: {studentId: userId, assignmentId: assignmentId}});
  let assignment = await Assignment.findByPk(user_assignment.assignmentId);
  let maxEntries = assignment.maxEntries;
  let poasStats = [];

  try {
    for (let poasId of poasList) {
      let counts = [];
      const lottery = await Lottery.findAll({
        where: {
          poaId: poasId,
          assigned: { [Op.gt]: 0 }
        },
        include: [{
          model: UserAssignments,
          where: { assignmentId: assignmentId }
        }]
      });

      if (lottery.length) {
        for (let i = 1; i <= maxEntries; i++) {
          counts.push(-1);
        }
        poasStats.push(counts);
        continue;
      }

      for (let i = 1; i <= maxEntries; i++) {
        let lotteryCount = 0;
        let pa = await PoasAssignment.findOne({
          where: {
            assignmentId: assignment.assignmentId,
            poasId: poasId,
            preference: i
          }
        });

        if (pa) {
          const lotteries = await pa.getLotteries({
            where: {
              '$user_assignment.preferenceChosen$': { [Op.eq]: 0 }
            },
            include: [{ model: UserAssignments }]
          });
          lotteryCount = lotteries.length;
        }
        counts.push(lotteryCount);
      }
      poasStats.push(counts);
    }
  } catch(err) {
    console.log(err.message || "Some error occurred while retrieving POAS stats.");
  }

  return poasStats;
}

exports.getStats = async (req, res) => {
  try {
    let assignment = req.body.assignment;
    let poasList = req.body.poasList;
    return getCounts(assignment, poasList);
  } catch(err) {
    console.log(err.message || "Some error occurred while retrieving POAS stats.");
  }
};
