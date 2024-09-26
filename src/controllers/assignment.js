const Assignment = require("../models/assignment");

const createAssignment = async (req, res) => {
  try {
    const AssignmentData = req.body;
    const Assignment = new Assignment(AssignmentData);

    const AssignmentStored = await Assignment.save();
    res.status(201).send(AssignmentStored);
  } catch (error) {
    res
      .status(400)
      .send({ msg: "Error al crear la asignación", error: error.message });
  }
};

const getAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const Assignment = await Assignment.findById(id);

    if (!Assignment) {
      return res.status(404).send({ msg: "No se encontró la asignación" });
    }
    res.status(200).send(Assignment);
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor", error: error.message });
  }
};

const getAssignmentes = async (req, res) => {
  try {
    const Assignmentes = await Assignment.find();
    res.status(200).send(Assignmentes);
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor", error: error.message });
  }
};

const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const AssignmentData = req.body;

    const AssignmentUpdated = await Assignment.findByIdAndUpdate(
      { _id: id },
      AssignmentData,
      { new: true }
    );

    if (!AssignmentUpdated) {
      return res
        .status(404)
        .send({ msg: "No se encontró la asignación para actualizar" });
    }
    res.status(200).send(AssignmentUpdated);
  } catch (error) {
    res
      .status(400)
      .send({ msg: "Error al actualizar la asignación", error: error.message });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const AssignmentDeleted = await Assignment.findByIdAndDelete(id);

    if (!AssignmentDeleted) {
      return res
        .status(404)
        .send({ msg: "No se encontró la asignación para eliminar" });
    }
    res.status(200).send({ msg: "Asignación eliminada correctamente" });
  } catch (error) {
    res
      .status(400)
      .send({ msg: "Error al eliminar la asignación", error: error.message });
  }
};

module.exports = {
  createAssignment,
  getAssignment,
  getAssignmentes,
  updateAssignment,
  deleteAssignment,
};
