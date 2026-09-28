const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const db = require("./app/models");
const User = db.user;
const Role = db.role;
const Assignment = db.assignment;
const Lottery = db.lottery;
const Poas = db.poas;

const app = express();

global.__basedir = __dirname;

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// db.sequelize.sync();
// drop the table if it already exists (not anymore)
db.sequelize.sync({ force: true }).then(() => {
  console.log("Drop and re-sync db.");
  initial();
});

async function initial() {
  await Role.create({
    id: 1,
    name: "admin"
  });
 
  await Role.create({
    id: 2,
    name: "teacher"
  });
 
  await Role.create({
    id: 3,
    name: "student"
  });

  // Root admin account
  user = await User.create({
    userId: 1,
    username: "code4real",
    email: "code4real.org@gmail.com",
  });
  await user.setRoles([1]);

  // Teacher account for testing
  user = await User.create({
    userId: 2,
    username: "florence.y.zhao",
    email: "florence.y.zhao@gmail.com",
  });
  await user.setRoles([2]);

  // Sample teacher account
  user = await User.create({
    userId: 3,
    username: "carousel4schools",
    email: "carousel4schools@gmail.com",
  });
  await user.setRoles([2]);

  assignment = await Assignment.create({
    assignmentId: 1,
    title: "Person of American Significance",
    description: "Choose 3-5 individuals who have had significant impact on the United States, who you would be interested in researching and writing about. No two students currently enrolled in APENG will focus on the same Person of American Significance.",
    minEntries: 3,
    maxEntries: 5,
    state: 0,  // default: open
    ownerId: 2
  });
  await assignment.addAssigner([2]);
  await assignment.addAssigner([3]);


  nonexistentPoas = await Poas.create({
    id: 1,
    name: "*** POAS NOT FOUND ***",
    wikiPageId: 0,
    wikiLink: " ",
    wikiDescription: "Check spelling and use the most commonly known name for the POAS",
    count: 0
  });

  ambiguousPoas = await Poas.create({
    id: 2,
    name: "*** AMBIGUOUS ENTRY ***",
    wikiPageId: 0,
    wikiLink: " ",
    wikiDescription: "Please use the most commonly known name for the person (use the title of the person's Wikipedia page)",
    count: 0
  });

  /*
  poas1 = await Poas.create({
    id: 1,
    firstName: "Ray",
    lastName: "Kroc",
    count: 1
  });

  poas2 = await Poas.create({
    id: 2,
    firstName: "Howard",
    lastName: "Hughes",
    count: 1
  });

  lottery1 = await Lottery.create({
    id: 1,
    firstName: "Ray",
    lastName: "Kroc",
    biography: "bio",
    statement: "my statement",
    preference: 1,
    poaId: 1,
    userAssignmentId: 2
  });

  lottery2 = await Lottery.create({
    id: 2,
    firstName: "Howard",
    lastName: "Hughes",
    biography: "Bio",
    statement: "Statement",
    preference: 2,
    poaId: 2,
    userAssignmentId: 2
  });
  */
};

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});


require("./app/routes/user.routes")(app);
require("./app/routes/auth.routes")(app);
require("./app/routes/admin.routes")(app);
require("./app/routes/teacher.routes")(app);
require("./app/routes/student.routes")(app);
require("./app/routes/assignment.routes")(app);
require("./app/routes/lottery.routes")(app);
require("./app/routes/poas.routes")(app);
require("./app/routes/file.routes")(app);

process.on('uncaughtException', err => {
  console.error('There was an uncaught error', err)
  //process.exit(1) //mandatory (as per the Node.js docs)
})

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
