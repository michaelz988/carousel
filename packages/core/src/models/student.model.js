module.exports = (sequelize, Sequelize) => {
  const Student = sequelize.define("student", {
    email: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    title:{
      type: Sequelize.STRING,
    },
    poas1: {
      type: Sequelize.STRING,
    },
    sig1: {
      type: Sequelize.STRING,
    },
    bio1: {
      type: Sequelize.STRING,
    },
    poas2: {
      type: Sequelize.STRING,
    },
    sig2: {
      type: Sequelize.STRING,
    },
    bio2: {
      type: Sequelize.STRING,
    },
    poas3: {
      type: Sequelize.STRING,
    },
    sig3: {
      type: Sequelize.STRING,
    },
    bio3: {
      type: Sequelize.STRING,
    },

  });



  return Student;

};