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

  // Seed teacher accounts
  [user] = await User.findOrCreate({
    where: { email: "florence.y.zhao@gmail.com" },
    defaults: {
      userId: 2,
      username: "florence.y.zhao",
      email: "florence.y.zhao@gmail.com",
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
