const Assignment = require("../models/assignment");
const User = require("../models/user");
const Shift = require("../models/shift");
const multer = require("multer");
const upload = multer();

const mongoose = require('mongoose');

const createAssignment = async (req, res) => {
  const { 
    id_user,
    id_shift, 
    time_start, 
    time_end, 
  } = req.body;

  if (!id_user || !id_shift || !time_start || !time_end) {
    return res.status(400).send({ msg: "Todos los campos obligatorios deben ser completados" });
  }

  try {
    if (!mongoose.isValidObjectId(id_user)) {
      return res.status(400).send({ msg: "ID de usuario no válido" });
    }
    const userExists = await User.findById(id_user);
    if (!userExists) {
      return res.status(404).send({ msg: "Usuario no encontrado" });
    }

    if (!mongoose.isValidObjectId(id_shift)) {
      return res.status(400).send({ msg: "ID de turno no válido" });
    }
    const shiftExists = await Shift.findById(id_shift);
    if (!shiftExists) {
      return res.status(404).send({ msg: "Turno no encontrado" });
    }

    const assignment = new Assignment({ 
      id_user,
      id_shift, 
      time_start, 
      time_end, 
    });

    const assignmentStored = await assignment.save();
    res.status(201).send(assignmentStored);
  } catch (error) {
    res.status(500).send({ msg: "Error al crear la asignación", error: error.message });
  }
};

const getMyAssignments = async (req, res) => {
  try {
    const userId = req.user._id;
    const assignments = await Assignment.find({ id_user: userId });
    if (!assignments || assignments.length === 0) {
      return res.status(404).send({ msg: "No se encontraron asignaciones para este usuario" });
    }
    res.status(200).send(assignments);
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor", error: error.message });
  }
};

const getAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).send({ msg: "No se encontró la asignación" });
    }
    res.status(200).send(assignment);
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
  createAssignment: [upload.none(), createAssignment],
  getAssignment,
  getMyAssignments: [upload.none(), getMyAssignments],
  getAssignmentes,
  updateAssignment,
  deleteAssignment,
};
