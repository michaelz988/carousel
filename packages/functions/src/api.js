const serverlessExpress = require("@vendia/serverless-express");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

var corsOptions = {
  origin: "*"
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Simple root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Carousel application." });
});

// Register all routes
require("./routes/user.routes")(app);
require("./routes/auth.routes")(app);
require("./routes/admin.routes")(app);
require("./routes/teacher.routes")(app);
require("./routes/student.routes")(app);
require("./routes/assignment.routes")(app);
require("./routes/lottery.routes")(app);
require("./routes/poas.routes")(app);
require("./routes/file.routes")(app);

const serverlessExpressInstance = serverlessExpress({ app });

exports.handler = async (event, context) => {
  return serverlessExpressInstance(event, context);
};
