module.exports = (sequelize, Sequelize) => {
  const Assignment = sequelize.define("assignments", {
    assignmentId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    },
    minEntries: {
      type: Sequelize.INTEGER
    },
    maxEntries: {
      type: Sequelize.INTEGER
    },
    dueDate: {
      type: Sequelize.DATEONLY
    },
    state: {
      type: Sequelize.INTEGER
    },
    // The teacher who can share, transfer and delete this assignment. Always
    // also one of its teachers (a row in user_assignments). Not to be confused
    // with user_assignments.owner, which records 'teacher' or 'student'.
    ownerId: {
      type: Sequelize.INTEGER
    }
  });

  return Assignment;
};
