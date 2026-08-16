const { Sequelize, sequelize } = require("../db");

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user.model")(sequelize, Sequelize);
db.role = require("./role.model")(sequelize, Sequelize);
db.assignment = require("./assignment.model")(sequelize, Sequelize);
db.user_assignments = require("./user_assignments.model")(sequelize, Sequelize);
db.lottery = require("./lottery.model")(sequelize, Sequelize);
db.poas = require("./poas.model")(sequelize, Sequelize);
db.poas_assignment = require("./poas_assignment.model")(sequelize, Sequelize);

// Associations — preserved exactly from backend
db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId"
});
db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId"
});

db.assignment.belongsToMany(db.user, {
  through: {
    model: "user_assignments",
    scope: { owner: 'teacher'}
  },
  foreignKey: 'assignmentId',
  otherKey: "teacherId",
  as: "Assigner"
});
db.assignment.belongsToMany(db.user, {
  through: {
    model: "user_assignments",
    scope: { owner: 'student'}
  },
  foreignKey: 'assignmentId',
  otherKey: "studentId",
  as: "Assignee"
});

db.user.belongsToMany(db.assignment, {
  through: {
    model: "user_assignments",
    scope: { owner: 'teacher'}
  },
  foreignKey: 'teacherId',
  otherKey: 'assignmentId',
  as: "Assignment"
});
db.user.belongsToMany(db.assignment, {
  through: {
    model: "user_assignments",
    scope: { owner: 'student'}
  },
  foreignKey: 'studentId',
  otherKey: 'assignmentId',
  as: "Assigned"
});

db.user_assignments.belongsTo(db.user, {
  foreignKey: 'studentId',
  as: 'Student'
});

db.user_assignments.belongsTo(db.user, {
  foreignKey: 'teacherId',
  as: 'Teacher'
});

db.user_assignments.belongsTo(db.user_assignments, {
  foreignKey: 'teacher',
  as: 'ClassTeacher'
});

db.user_assignments.hasMany(db.user_assignments, {
  foreignKey: 'teacher',
  scope: { owner: 'student'},
  as: 'ClassStudents'
});

db.assignment.hasMany(db.user_assignments, {
  foreignKey: 'assignmentId',
  scope: { owner: 'student'},
  as: 'studentAssignments'
});
db.assignment.hasMany(db.user_assignments, {
  foreignKey: 'assignmentId',
  scope: { owner: 'teacher'},
  as: 'teacherAssignments'
});

db.user_assignments.hasMany(db.lottery, { onDelete: 'CASCADE' });
db.lottery.belongsTo(db.user_assignments);

db.poas_assignment.hasMany(db.lottery, { onDelete: 'CASCADE' });
db.lottery.belongsTo(db.poas_assignment);

db.user_assignments.hasOne(db.poas);

db.poas.hasMany(db.lottery);
db.lottery.belongsTo(db.poas);

db.ROLES = ["admin", "teacher", "student"];

module.exports = db;
