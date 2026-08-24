module.exports = (sequelize, Sequelize) => {
  const Lottery = sequelize.define("lotteries", {
    name: {
      type: Sequelize.STRING
    },
    wikiPageID: {
      type: Sequelize.INTEGER
    },
    wikiLink: {
      type: Sequelize.STRING,
    },
    wikiDescription: {
      type: Sequelize.STRING
    },
    /*
    middleName: {
      type: Sequelize.STRING
    },
    lastName: {
      type: Sequelize.STRING
    },
    */
    biography: {
      type: Sequelize.STRING
    },
    statement: {
      type: Sequelize.STRING
    },
    assigned: {
      type: Sequelize.INTEGER
    },
    preference: {
      type: Sequelize.INTEGER
    }
  });

  return Lottery;
};
