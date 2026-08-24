const db = require("@carousel/core");
const Assignment = db.assignment;
const PoasAssignment = db.poas_assignment;
const Lottery = db.lottery;
const Poas = db.poas;

exports.addLottery = async (assignment, poas, pref, lottery) => {
  try {
    [ poas_assignment, created ] = await PoasAssignment.findOrCreate({
        where: { assignmentId: assignment, poasId: poas.id, preference: pref},
        defaults: { count: 1 }
      });

    await poas_assignment.addLottery(lottery.id);
    if (!created) {
      poas_assignment.count = poas_assignment.count + 1;
    } else {
      poas_assignment.count = 1;
    }
    await poas_assignment.save();

    return poas_assignment;
  } catch(err) {
    console.log(err.message || "Some error occurred while recording the POAS entry.");
  }
};

exports.delLottery = async (assignment, poas, pref, lottery) => {
    try {
      poas_assignment = await PoasAssignment.findOne({
        where: { assignmentId: assignment, poasId: poas.id, preference: pref }
      });
  
      if (poas_assignment) {
        poas_assignment.removeLottery(lottery.id);
        poas_assignment.count = poas_assignment.count - 1;
        poas_assignment.save();
      }
  
      return poas_assignment;
    } catch(err) {
      console.log(err.message || "Some error occurred while recording the POAS entry.");
    }
};
