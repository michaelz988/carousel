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
    }, {
      // teacherId and studentId are added by the belongsToMany associations in
      // models/index.js. Sequelize auto-generated a unique index for the
      // teacher side that covered teacherId ALONE — despite being named
      // ...teacherId_assignmentId_unique — which capped every teacher at a
      // single assignment for the life of the database. Declaring both pairs
      // explicitly keeps a teacher (or student) unique *per assignment*
      // instead of globally.
      indexes: [
        {
          unique: true,
          name: 'ua_teacher_per_assignment',
          fields: ['assignmentId', 'teacherId']
        },
        {
          unique: true,
          name: 'ua_student_per_assignment',
          fields: ['assignmentId', 'studentId']
        }
      ]
    });

    return UserAssignments;
  };