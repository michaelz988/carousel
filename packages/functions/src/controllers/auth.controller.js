const {OAuth2Client} = require('google-auth-library');
const db = require("@carousel/core");
const User = db.user;
const Role = db.role;

var jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "code4real-secret-key";

// Rosters are typed by hand, but Google sends the address lowercase and, for
// Gmail, spelled the way the account was created. Gmail ignores case and dots
// before the @; other domains (school accounts) ignore only case. Production's
// email column compares exactly (utf8mb4_bin), so both sides are normalized.
const GMAIL_DOMAINS = ["gmail.com", "googlemail.com"];

function emailKey(address) {
  const [local, domain] = address.toLowerCase().split("@");
  return GMAIL_DOMAINS.includes(domain) ? `${local.replace(/\./g, "")}@gmail.com` : `${local}@${domain}`;
}

const storedEmailKey = db.sequelize.literal(
  "CASE WHEN LOWER(SUBSTRING_INDEX(email, '@', -1)) IN ('gmail.com', 'googlemail.com') " +
  "THEN CONCAT(REPLACE(LOWER(SUBSTRING_INDEX(email, '@', 1)), '.', ''), '@gmail.com') " +
  "ELSE LOWER(email) END"
);

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

    // An exact match wins, so an address that already signs in keeps its row.
    if (!user) {
      user = await User.findOne({
        where: db.sequelize.where(storedEmailKey, emailKey(gmail)),
        order: [['userId', 'ASC']]
      });
    }

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
