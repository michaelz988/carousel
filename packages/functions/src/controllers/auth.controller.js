const {OAuth2Client} = require('google-auth-library');
const db = require("@carousel/core");
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET || "code4real-secret-key";

exports.signup = (req, res) => {
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  })
    .then(user => {
      if (req.body.roles) {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles
            }
          }
        }).then(roles => {
          user.setRoles(roles).then(() => {
            res.send({ message: "User was registered successfully!" });
          });
        });
      } else {
        user.setRoles([1]).then(() => {
          res.send({ message: "User was registered successfully!" });
        });
      }
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = async (req, res) => {
  let id_token = req.body.credential;

  try {
    const client = new OAuth2Client("921798240468-7ef6ep21omf9pv15m4ilpa07patqjeio.apps.googleusercontent.com");
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: "921798240468-7ef6ep21omf9pv15m4ilpa07patqjeio.apps.googleusercontent.com",
    });
    const payload = ticket.getPayload();
    const gmail = payload['email'];
    const username = gmail.match(/^([^@]*)@/)[1];

    let user = await User.findOne({
      where: {
        email: gmail
      },
      defaults: {
        username: username,
        gid: payload['sub'],
        firstName: payload['given_name'],
        lastName: payload['family_name']
      }
    });

    if (!user) {
      return res.status(404).send({ message: "User not registered in the system." });
    }

    if (!user.gid) {
      user.firstName = payload['given_name'];
      user.lastName = payload['family_name'];
      user.gid = payload['sub'];
      user.save();
    }

    var token = jwt.sign({ id: user.userId }, JWT_SECRET, {
      expiresIn: 86400
    });

    var authorities = [];
    let roles = await user.getRoles();
    for (let i = 0; i < roles.length; i++) {
      authorities.push("ROLE_" + roles[i].name.toUpperCase());
    }
    res.status(200).send({
      id: user.userId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roles: authorities,
      accessToken: token
    });
  } catch(err) {
    res.status(500).send({ message: err.message });
  }
}
