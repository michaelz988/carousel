const db = require("@carousel/core");
const Assignment = db.assignment;
const UserAssignment = db.user_assignments;
const Op = db.Sequelize.Op;

exports.create = async (req, res) => {
  if (!req.body.title) {
    res.status(400).send({ message: "Title cannot be empty!" });
    return;
  }

  const minEntries = parseInt(req.body.minEntries, 10) || 3;
  const maxEntries = parseInt(req.body.maxEntries, 10) || 5;

  if (minEntries < 1 || maxEntries < minEntries) {
    res.status(400).send({
      message: "Maximum entries must be at least the minimum, and minimum at least 1."
    });
    return;
  }

  try {
    // A new assignment starts open for entries, like the seeded one.
    const assignment = await Assignment.create({
      title: req.body.title,
      description: req.body.description,
      minEntries: minEntries,
      maxEntries: maxEntries,
      dueDate: req.body.dueDate || null,
      state: 0,
      ownerId: req.userId
    });

    // Link the creating teacher. GET /teacher/assignments resolves through
    // user.getAssignment(), so without this the creator would never see the
    // assignment they just made.
    await assignment.addAssigner(req.userId);

    res.send(assignment);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the Assignment."
    });
  }
};

exports.findOne = (req, res) => {
  const id = parseInt(req.params.id);
  Assignment.findByPk(id)
    .then(data => { res.send(data); })
    .catch(err => {
      res.status(500).send({ message: "Error retrieving Assignment with id=" + id });
    });
};

// Only teachers on the assignment may edit it, and only its descriptive
// fields. `state` moves through the lock/unlock/run endpoints and `ownerId`
// through the sharing endpoints -- the edit form posts the whole record back,
// so passing req.body through would let a stale form rewind the lottery or
// let any member take ownership.
const EDITABLE = ["title", "description", "minEntries", "maxEntries", "dueDate"];

exports.update = async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    const membership = await UserAssignment.findOne({
      where: { assignmentId: id, teacherId: req.userId, owner: "teacher" }
    });
    if (!membership) {
      return res.status(404).send({ message: "Assignment not found." });
    }

    const changes = {};
    for (const key of EDITABLE) {
      if (key in req.body) changes[key] = req.body[key];
    }

    await Assignment.update(changes, { where: { assignmentId: id } });
    res.send({ message: "Assignment was updated successfully." });
  } catch (err) {
    res.status(500).send({ message: "Error updating Assignment with id=" + id });
  }
};
