module.exports = (sequelize, Sequelize) => {
    const UserAssignments = sequelize.define("user_assignments", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        primaryKey: false,
        /*
        references: {
          model: 'users',
          key: 'userId'   // TODO: why not userId, I do not understand, but it works
        },
        */
        onDelete: 'cascade',
        onUpdate: 'cascade',
        unique: 'unique-user-per-assignment'
      },
      assignmentId: {
        type: Sequelize.INTEGER,
        primaryKey: false,
        /*
        references: {
          model: 'assignments',  // not assignments? the example is hard to follow
          key: 'assignmentId'
        },
        */
        onDelete: 'cascade',
        onUpdate: 'cascade',
        unique: 'unique-user-per-assignment'
      },
      owner: {
        type: Sequelize.STRING
      },
      period: {
        type: Sequelize.INTEGER
      },
      sequence: {
        type: Sequelize.INTEGER
      },
      preferenceChosen: {
        type: Sequelize.INTEGER
      }
    });
  
    return UserAssignments;
  };