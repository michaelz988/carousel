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

  // Seed admin accounts. They add the teachers; nothing else is seeded.
  for (const [userId, email] of [[1, "code4real.org@gmail.com"], [2, "carousel4schools@gmail.com"]]) {
    const [user] = await User.findOrCreate({
      where: { email },
      defaults: { userId, username: email.split("@")[0], email }
    });
    const roles = await user.getRoles();
    if (roles.length === 0) await user.setRoles([1]);
  }
  console.log("Users seeded.");

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
