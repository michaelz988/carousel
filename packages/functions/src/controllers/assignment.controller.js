const db = require("@carousel/core");
const Assignment = db.assignment;
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
  if (!req.body.title) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  const assignment = {
    title: req.body.title,
    description: req.body.description,
    content: req.body.content
  };

  Assignment.create(assignment)
    .then(data => { res.send(data); })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Assignment."
      });
    });
};

exports.findOne = (req, res) => {
  const id = parseInt(req.params.id);
  Assignment.findByPk(id)
    .then(data => { res.send(data); })
    .catch(err => {
      res.status(500).send({ message: "Error retrieving Assignment with id=" + id });
    });
};

exports.update = (req, res) => {
  const id = req.params.id;
  Assignment.update(req.body, { where: { assignmentId: id } })
    .then(num => {
      if (num == 1) {
        res.send({ message: "Assignment was updated successfully." });
      } else {
        res.send({ message: `Cannot update Assignment with id=${id}. Maybe Assignment was not found or req.body is empty!` });
      }
    })
    .catch(err => {
      res.status(500).send({ message: "Error updating Assignment with id=" + id });
    });
};

exports.delete = (req, res) => {
  const id = req.params.id;
  Assignment.destroy({ where: { id: id } })
    .then(num => {
      if (num == 1) {
        res.send({ message: "Assignment was deleted successfully!" });
      } else {
        res.send({ message: `Cannot delete Assignment with id=${id}. Maybe Assignment was not found!` });
      }
    })
    .catch(err => {
      res.status(500).send({ message: "Could not delete Assignment with id=" + id });
    });
};

exports.deleteAll = (req, res) => {
  Assignment.destroy({ where: {}, truncate: false })
    .then(nums => {
      res.send({ message: `${nums} Assignments were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all Assignments."
      });
    });
};
