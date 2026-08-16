module.exports = (sequelize, Sequelize) => {
    const PoasAssignment = sequelize.define("poas_assignment", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      assignmentId: {
        type: Sequelize.INTEGER,
        primaryKey: false,
        allowNull: false
      },
      poasId: {
        type: Sequelize.INTEGER,
        primaryKey: false,
        allowNull: false
      },
      preference: {
        type: Sequelize.INTEGER,
        primaryKey: false,
        allowNull: false
      },
      count: {
        type: Sequelize.INTEGER
      }
    });
  
    return PoasAssignment;
  };