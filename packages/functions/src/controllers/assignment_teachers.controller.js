// Sharing an assignment between teachers. The owner (assignments.ownerId) can
// add, remove and hand over to other teachers and delete the assignment; any
// other teacher on it can leave.
//
// Rule violations answer 409 rather than 403: the frontend treats 403 as an
// expired session and sends the user back to sign in.
const db = require("@carousel/core");
const User = db.user;
const Role = db.role;
const Assignment = db.assignment;
const UserAssignment = db.user_assignments;
const Lottery = db.lottery;
const PoasAssignment = db.poas_assignment;
const Op = db.Sequelize.Op;

const TEACHER_FIELDS = ["userId", "username", "email", "firstName", "lastName"];

function findMembership(assignmentId, teacherId) {
  return UserAssignment.findOne({
    where: { assignmentId, teacherId, owner: "teacher" }
  });
}

// A teacher's students hang off their membership row (their `teacher` column
// points at its id). Removing the row strips those students of their section,
// so it is blocked while this is non-zero.
function countStudents(membership) {
  return UserAssignment.count({
    where: { owner: "student", teacher: membership.id }
  });
}

function countOtherTeachers(assignment) {
  return UserAssignment.count({
    where: {
      assignmentId: assignment.assignmentId,
      owner: "teacher",
      teacherId: { [Op.ne]: assignment.ownerId }
    }
  });
}

function nameOf(user) {
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return full || user.username || user.email;
}

function students(n) {
  return n === 1 ? "1 student" : `${n} students`;
}

// Loads the assignment and the caller's membership. Anyone who is not a
// teacher on it gets 404, so assignment ids are not confirmed to outsiders.
async function load(req, res) {
  const assignmentId = parseInt(req.params.id, 10);
  const assignment = assignmentId ? await Assignment.findByPk(assignmentId) : null;
  const membership = assignment && await findMembership(assignmentId, req.userId);
  if (!membership) {
    res.status(404).send({ message: "Assignment not found." });
    return null;
  }
  return { assignment, isOwner: assignment.ownerId === req.userId };
}

function ownerOnly(ctx, res) {
  if (ctx.isOwner) return true;
  res.status(409).send({ message: "Only the owner of this assignment can do that." });
  return false;
}

// Deletes an assignment and everything attached to it. The tables have no
// foreign keys to cascade through, so each is cleared explicitly.
async function destroyAssignment(assignment) {
  const assignmentId = assignment.assignmentId;
  await db.sequelize.transaction(async (transaction) => {
    const rows = await UserAssignment.findAll({
      where: { assignmentId }, attributes: ["id"], transaction
    });
    const poas = await PoasAssignment.findAll({
      where: { assignmentId }, attributes: ["id"], transaction
    });
    await Lottery.destroy({
      where: {
        [Op.or]: [
          { userAssignmentId: rows.map(r => r.id) },
          { poasAssignmentId: poas.map(p => p.id) }
        ]
      },
      transaction
    });
    await UserAssignment.destroy({ where: { assignmentId }, transaction });
    await PoasAssignment.destroy({ where: { assignmentId }, transaction });
    await assignment.destroy({ transaction });
  });
}

// Why a teacher account cannot be removed yet, or null if it can. Used by the
// admin's remove-teacher endpoints.
exports.removalBlocker = async (user) => {
  const memberships = await UserAssignment.findAll({
    where: { teacherId: user.userId, owner: "teacher" }
  });
  for (const membership of memberships) {
    const assignment = await Assignment.findByPk(membership.assignmentId);
    if (!assignment) continue;

    if (assignment.ownerId === user.userId && await countOtherTeachers(assignment) > 0) {
      return `${nameOf(user)} owns "${assignment.title}", which other teachers share. ` +
        "They need to transfer ownership first.";
    }
    const n = await countStudents(membership);
    if (n > 0) {
      return `${nameOf(user)} has ${students(n)} on "${assignment.title}". ` +
        "They need to remove their students from it first.";
    }
  }
  return null;
};

// Deletes the assignments a teacher owns and their remaining memberships, ahead
// of deleting the account. Only safe once removalBlocker has returned null.
exports.releaseTeacher = async (user) => {
  const owned = await Assignment.findAll({ where: { ownerId: user.userId } });
  for (const assignment of owned) {
    await destroyAssignment(assignment);
  }
  await UserAssignment.destroy({ where: { teacherId: user.userId, owner: "teacher" } });
};

// GET /api/teacher/assignments/:id/teachers
async function teachersOf(assignment) {
  const memberships = await UserAssignment.findAll({
    where: { assignmentId: assignment.assignmentId, owner: "teacher" },
    include: [{ model: User, as: "Teacher", attributes: TEACHER_FIELDS }],
    order: [["id", "ASC"]]
  });

  const teachers = [];
  for (const m of memberships) {
    if (!m.Teacher) continue;
    teachers.push({
      ...m.Teacher.get({ plain: true }),
      isOwner: m.Teacher.userId === assignment.ownerId,
      studentCount: await countStudents(m)
    });
  }
  return teachers;
}

exports.list = async (req, res) => {
  try {
    const ctx = await load(req, res);
    if (!ctx) return;
    res.send(await teachersOf(ctx.assignment));
  } catch (err) {
    res.status(500).send({ message: "Could not load the teachers on this assignment." });
  }
};

// Admin-only and read-only: admins are not members, so skip load().
exports.listForAdmin = async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(parseInt(req.params.id, 10) || 0);
    if (!assignment) {
      return res.status(404).send({ message: "Assignment not found." });
    }
    res.send(await teachersOf(assignment));
  } catch (err) {
    res.status(500).send({ message: "Could not load the teachers on this assignment." });
  }
};

// GET /api/teacher/assignments/:id/colleagues
// Teacher accounts the owner can add: every teacher not already on it.
exports.colleagues = async (req, res) => {
  try {
    const ctx = await load(req, res);
    if (!ctx || !ownerOnly(ctx, res)) return;

    const members = await UserAssignment.findAll({
      where: { assignmentId: ctx.assignment.assignmentId, owner: "teacher" },
      attributes: ["teacherId"]
    });
    const memberIds = new Set(members.map(m => m.teacherId));

    const role = await Role.findOne({ where: { name: "teacher" } });
    const teachers = await role.getUsers({
      attributes: TEACHER_FIELDS,
      joinTableAttributes: []
    });

    res.send(
      teachers
        .filter(t => !memberIds.has(t.userId))
        .map(t => t.get({ plain: true }))
    );
  } catch (err) {
    res.status(500).send({ message: "Could not load the list of teachers." });
  }
};

// POST /api/teacher/assignments/:id/teachers  { userId }
exports.add = async (req, res) => {
  try {
    const ctx = await load(req, res);
    if (!ctx || !ownerOnly(ctx, res)) return;

    const userId = parseInt(req.body.userId, 10);
    const user = userId ? await User.findByPk(userId) : null;
    const roles = user ? (await user.getRoles()).map(r => r.name) : [];
    if (!roles.includes("teacher")) {
      return res.status(409).send({ message: "That account is not a teacher." });
    }
    if (await findMembership(ctx.assignment.assignmentId, userId)) {
      return res.status(409).send({ message: `${nameOf(user)} is already on this assignment.` });
    }

    await ctx.assignment.addAssigner(userId);
    const teacher = {};
    for (const field of TEACHER_FIELDS) teacher[field] = user[field];
    res.send({ ...teacher, isOwner: false, studentCount: 0 });
  } catch (err) {
    res.status(500).send({ message: "Could not add the teacher." });
  }
};

// DELETE /api/teacher/assignments/:id/teachers/:userId
// The owner removing someone, or a teacher removing themselves (resigning).
exports.remove = async (req, res) => {
  try {
    const ctx = await load(req, res);
    if (!ctx) return;

    const userId = parseInt(req.params.userId, 10);
    const resigning = userId === req.userId;

    if (resigning && ctx.isOwner) {
      return res.status(409).send({
        message: "You own this assignment. Transfer ownership to another teacher before leaving, or delete it."
      });
    }
    if (!resigning && !ownerOnly(ctx, res)) return;

    const membership = await findMembership(ctx.assignment.assignmentId, userId);
    if (!membership) {
      return res.status(404).send({ message: "That teacher is not on this assignment." });
    }

    const n = await countStudents(membership);
    if (n > 0) {
      const user = await User.findByPk(userId);
      return res.status(409).send({
        message: resigning
          ? `You still have ${students(n)} on this assignment. Remove them from your student list first.`
          : `${nameOf(user)} still has ${students(n)} on this assignment. Ask them to remove their students first.`
      });
    }

    await membership.destroy();
    res.send({ userId });
  } catch (err) {
    res.status(500).send({ message: "Could not remove the teacher." });
  }
};

// PUT /api/teacher/assignments/:id/owner  { userId }
exports.transfer = async (req, res) => {
  try {
    const ctx = await load(req, res);
    if (!ctx || !ownerOnly(ctx, res)) return;

    const userId = parseInt(req.body.userId, 10);
    if (userId === req.userId) {
      return res.status(409).send({ message: "You already own this assignment." });
    }
    if (!userId || !(await findMembership(ctx.assignment.assignmentId, userId))) {
      return res.status(409).send({ message: "Ownership can only go to a teacher on this assignment." });
    }

    ctx.assignment.ownerId = userId;
    await ctx.assignment.save();
    res.send(ctx.assignment);
  } catch (err) {
    res.status(500).send({ message: "Could not transfer ownership." });
  }
};

// DELETE /api/teacher/assignments/:id
exports.destroy = async (req, res) => {
  try {
    const ctx = await load(req, res);
    if (!ctx || !ownerOnly(ctx, res)) return;

    if (await countOtherTeachers(ctx.assignment) > 0) {
      return res.status(409).send({
        message: "Other teachers still share this assignment. Remove them first."
      });
    }

    await destroyAssignment(ctx.assignment);
    res.send({ assignmentId: ctx.assignment.assignmentId });
  } catch (err) {
    res.status(500).send({ message: "Could not delete the assignment." });
  }
};
