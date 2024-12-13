const Assignment = require("../models/assignment");
const User = require("../models/user");
const Shift = require("../models/shift");
const multer = require("multer");
const upload = multer();
const { assignShiftsToEmployees } = require('./AutomaticAssignment');

const mongoose = require('mongoose');

const createAssignment = async (req, res) => {
  const { 
    id_user,
    id_shift, 
  } = req.body;

  if (!id_user || !id_shift) {
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


const getDepartmentAssignments = async (req, res) => {
  try {
    const { rol, _id } = req.user;
    
    if (rol !== "jefe" && rol !== "admin") {
      return res.status(403).json({ 
        success: false, 
        msg: "No tienes permisos para acceder a esta información" 
      });
    }

    const userComplete = await User.findById(_id);
    if (!userComplete || !userComplete.id_department) {
      return res.status(400).json({ 
        success: false, 
        msg: "Usuario sin departamento asignado" 
      });
    }

    const departmentId = userComplete.id_department.toString();
    

    const usersInDepartment = await User.find({ 
      id_department: departmentId 
    }).select('_id');
    
    const userIds = usersInDepartment.map(user => new mongoose.Types.ObjectId(user._id));


    const simpleAssignments = await Assignment.find({
      id_user: { $in: userIds }
    });

    if (simpleAssignments.length > 0) {
      const assignments = await Assignment.aggregate([
        {
          $match: {
            id_user: { $in: userIds }
          }
        },
        {
          $lookup: {
            from: "usercollections", 
            localField: "id_user",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $lookup: {
            from: "shifts",
            localField: "id_shift",
            foreignField: "_id",
            as: "shift"
          }
        },
        {
          $match: {
            "user": { $ne: [] },
            "shift": { $ne: [] }
          }
        },
        {
          $unwind: "$user"
        },
        {
          $unwind: "$shift"
        },
        {
          $project: {
            _id: 1,
            id_user: 1,
            id_shift: 1,
            user: {
              _id: "$user._id",
              name: "$user.name",
              lastname: "$user.lastname",
              photo: "$user.photo",
              email: "$user.email",
              position: "$user.position",
              telephone: "$user.telephone"
            },
            shift: {
              _id: "$shift._id",
              name_shift: "$shift.name_shift",
              start_date: "$shift.start_date",
              end_date: "$shift.end_date"
            }
          }
        }
      ]);

      if (assignments.length > 0) {
        return res.status(200).json({
          success: true,
          data: assignments
        });
      }
    }
    return res.status(200).json({ 
      success: true, 
      data: [],
      msg: "No se encontraron asignaciones para este departamento" 
    });

  } catch (error) {
    console.error("Error detallado en getDepartmentAssignments:", error);
    res.status(500).json({ 
      success: false, 
      msg: "Error del servidor", 
      error: error.message 
    });
  }
};

const employeeNames = [
  'Juan', 'Pedro', 'María', 'Luis', 'Ana', 'Carlos', 'José', 'Laura', 'David', 'Elena', 
  'Antonio', 'Beatriz', 'Fernando', 'Carmen', 'Marta', 'Alberto', 'Pablo', 'Raquel', 
  'Sofía', 'Miguel'
];

const getAutomaticAsignments = async (req, res) => {
  try {
    const { rol, _id } = req.user;

    // Validar permisos del usuario
    if (rol !== "jefe" && rol !== "admin") {
      return res.status(403).json({
        success: false,
        msg: "No tienes permisos para acceder a esta información"
      });
    }

    // Obtener información del usuario
    const userComplete = await User.findById(_id);
    if (!userComplete || !userComplete.id_department) {
      return res.status(400).json({
        success: false,
        msg: "Usuario sin departamento asignado"
      });
    }

    const departmentId = userComplete.id_department.toString();

    // Obtener los empleados del departamento
    const usersInDepartment = await User.find({
      id_department: departmentId
    }).select('name');

    // Crear una lista de nombres de los empleados
    //const employeeNames = usersInDepartment.map(user => user.name);

    // Validar entrada para cantidad de semanas
    //const { numWeeks } = req.body;
    const numWeeks = 2;
    if (!numWeeks || typeof numWeeks !== 'number' || numWeeks < 1) {
      return res.status(400).json({
        success: false,
        msg: "La cantidad de semanas es requerida y debe ser un número válido"
      });
    }

    // Definir los turnos disponibles
    const shifts = ['Mañana', 'Tarde', 'Noche'];

    // Llamar a la función de asignación
    const assignedSchedule = assignShiftsToEmployees(employeeNames, shifts, numWeeks);

    // Responder con el resultado
    return res.status(200).json({
      success: true,
      data: assignedSchedule,
      msg: "Se asignaron los turnos correctamente"
    });
  } catch (error) {
    console.error("Error en getAutomaticAssignments:", error);
    res.status(500).json({
      success: false,
      msg: "Error del servidor",
      error: error.message
    });
  }
};




module.exports = {
  createAssignment: [upload.none(), createAssignment],
  getAssignment,
  getMyAssignments: [upload.none(), getMyAssignments],
  getDepartmentAssignments: [upload.none(), getDepartmentAssignments],
  getAutomaticAsignments: [upload.none(), getAutomaticAsignments],
  getAssignmentes,
  updateAssignment,
  deleteAssignment,
};
