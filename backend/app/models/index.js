const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.assignment = require("../models/assignment.model.js")(sequelize, Sequelize);
db.user_assignments = require("../models/user_assignments.model.js")(sequelize, Sequelize);
db.lottery = require("../models/lottery.model.js")(sequelize, Sequelize);
db.poas = require("../models/poas.model.js")(sequelize, Sequelize);
db.poas_assignment = require("../models/poas_assignment.model.js")(sequelize, Sequelize);

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
    scope: { owner: 'teacher'},
    unique: false
  },
  foreignKey: 'assignmentId',
  otherKey: "teacherId",
  as: "Assigner"
});
db.assignment.belongsToMany(db.user, {
  through: {
    model: "user_assignments",
    scope: { owner: 'student'},
    unique: false
  },
  foreignKey: 'assignmentId',
  otherKey: "studentId",
  as: "Assignee"
});

db.user.belongsToMany(db.assignment, {
  through: {
    model: "user_assignments",
    scope: { owner: 'teacher'},
    unique: false
  },
  foreignKey: 'teacherId',
  otherKey: 'assignmentId',
  as: "Assignment"
});
db.user.belongsToMany(db.assignment, {
  through: {
    model: "user_assignments",
    scope: { owner: 'student'},
    unique: false
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