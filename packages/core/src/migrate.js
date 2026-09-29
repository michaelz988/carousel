/**
 * Migration and seed script.
 * Run with: node packages/core/src/migrate.js
 * Requires DATABASE_URL (or DB_HOST/DB_NAME/DB_USER/DB_PASSWORD) env vars.
 */
const db = require("./models");
const User = db.user;
const Role = db.role;
const Assignment = db.assignment;
const Poas = db.poas;

async function migrate() {
  console.log("Syncing database (without force)...");
  await db.sequelize.sync();
  console.log("Database synced.");

  // assignments.ownerId arrived after the first deploy. sync() creates missing
  // tables but never alters existing ones, so add the column explicitly --
  // before anything below queries the assignments table.
  const queryInterface = db.sequelize.getQueryInterface();
  const assignmentColumns = await queryInterface.describeTable("assignments");
  if (!assignmentColumns.ownerId) {
    await queryInterface.addColumn("assignments", "ownerId", { type: db.Sequelize.INTEGER });
    console.log("Added assignments.ownerId.");
  }

  // Seed roles
  for (const [id, name] of [[1, "admin"], [2, "teacher"], [3, "student"]]) {
    await Role.findOrCreate({ where: { id }, defaults: { id, name } });
  }
  console.log("Roles seeded.");

  // Seed admin account
  let [user] = await User.findOrCreate({
    where: { email: "code4real.org@gmail.com" },
    defaults: {
      userId: 1,
      username: "code4real",
      email: "code4real.org@gmail.com",
    }
  });
  const adminRoles = await user.getRoles();
  if (adminRoles.length === 0) await user.setRoles([1]);

  // The first seed teacher was florence.y.zhao@gmail.com, whose Google account
  // can no longer be signed in to. Rename that row rather than adding a new one,
  // so user 2 keeps its assignments, ownership and students. Sign-in fills the
  // name and Google id back in from the new account.
  const replaced = await User.findOne({ where: { email: "florence.y.zhao@gmail.com" } });
  if (replaced) {
    const taken = await User.findOne({ where: { email: "brookvaleboy@gmail.com" } });
    if (taken) {
      console.warn(`Not renaming user ${replaced.userId}: brookvaleboy@gmail.com is already user ${taken.userId}.`);
    } else {
      replaced.email = "brookvaleboy@gmail.com";
      replaced.username = "brookvaleboy";
      replaced.gid = null;
      replaced.firstName = null;
      replaced.lastName = null;
      await replaced.save();
      console.log(`Renamed user ${replaced.userId} to brookvaleboy@gmail.com.`);
    }
  }

  // Seed teacher accounts
  [user] = await User.findOrCreate({
    where: { email: "brookvaleboy@gmail.com" },
    defaults: {
      userId: 2,
      username: "brookvaleboy",
      email: "brookvaleboy@gmail.com",
    }
  });
  let roles = await user.getRoles();
  if (roles.length === 0) await user.setRoles([2]);

  [user] = await User.findOrCreate({
    where: { email: "carousel4schools@gmail.com" },
    defaults: {
      userId: 3,
      username: "carousel4schools",
      email: "carousel4schools@gmail.com",
    }
  });
  roles = await user.getRoles();
  if (roles.length === 0) await user.setRoles([2]);

  console.log("Users seeded.");

  // Seed default assignment
  const [assignment] = await Assignment.findOrCreate({
    where: { assignmentId: 1 },
    defaults: {
      assignmentId: 1,
      title: "Person of American Significance",
      description: "Choose 3-5 individuals who have had significant impact on the United States, who you would be interested in researching and writing about. No two students currently enrolled in APENG will focus on the same Person of American Significance.",
      minEntries: 3,
      maxEntries: 5,
      state: 0
    }
  });
  try {
    await assignment.addAssigner([2]);
    await assignment.addAssigner([3]);
  } catch (e) {
    // Already associated
  }

  // Every assignment needs an owner: admins cannot assign one, so an ownerless
  // assignment could never be shared, handed over or deleted. The earliest
  // teacher on each becomes its owner.
  const ownerless = await Assignment.findAll({ where: { ownerId: null } });
  let ownersSet = 0;
  for (const a of ownerless) {
    const first = await db.user_assignments.findOne({
      where: { assignmentId: a.assignmentId, owner: "teacher" },
      order: [["id", "ASC"]]
    });
    if (first) {
      a.ownerId = first.teacherId;
      await a.save();
      ownersSet++;
    }
  }
  console.log(`Owners set on ${ownersSet} assignment(s).`);

  // Seed sentinel POAS entries
  await Poas.findOrCreate({
    where: { id: 1 },
    defaults: {
      id: 1,
      name: "*** POAS NOT FOUND ***",
      wikiPageID: 0,
      wikiLink: " ",
      wikiDescription: "Check spelling and use the most commonly known name for the POAS",
      count: 0
    }
  });

  await Poas.findOrCreate({
    where: { id: 2 },
    defaults: {
      id: 2,
      name: "*** AMBIGUOUS ENTRY ***",
      wikiPageID: 0,
      wikiLink: " ",
      wikiDescription: "Please use the most commonly known name for the person (use the title of the person's Wikipedia page)",
      count: 0
    }
  });

  console.log("Seed data created.");
  await db.sequelize.close();
  console.log("Done.");
}

migrate().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
