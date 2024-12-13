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
    if (!mongoose.isValidObjectId(id_user) || !mongoose.isValidObjectId(id_shift)) {
      return res.status(400).send({ msg: "ID de usuario o turno no válido" });
    }

    const userExists = await User.findById(new mongoose.Types.ObjectId(id_user));
    if (!userExists) {
      return res.status(404).send({ msg: "Usuario no encontrado" });
    }

    const shiftExists = await Shift.findById(new mongoose.Types.ObjectId(id_shift));
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
    const { startDate, endDate, employeeIds } = req.body;

    // Validar permisos del usuario
    if (rol !== "jefe" && rol !== "admin") {
      return res.status(403).json({
        success: false,
        msg: "No tienes permisos para acceder a esta información.",
      });
    }

    // Validar fechas y empleados
    if (!startDate || !endDate || !employeeIds || !Array.isArray(employeeIds)) {
      return res.status(400).json({
        success: false,
        msg: "Fechas de inicio, fin y lista de empleados son obligatorios.",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end) || start > end) {
      return res.status(400).json({
        success: false,
        msg: "Las fechas proporcionadas no son válidas.",
      });
    }

    // Validar existencia de empleados
    const validUsers = await User.find({ _id: { $in: employeeIds } }).select("_id");
    const validUserIds = validUsers.map((user) => user._id.toString());

    if (validUserIds.length !== employeeIds.length) {
      return res.status(400).json({
        success: false,
        msg: "Algunos de los IDs de empleados no son válidos.",
      });
    }

    const shifts = ["Mañana", "Tarde", "Noche"];

    // Generar cuadro de asignaciones usando el algoritmo
    const assignedSchedule = assignShiftsToEmployees(validUserIds, shifts, start, end);

    const shiftsToInsert = [];
    const assignmentsToInsert = [];

    // Generar turnos y asignaciones
    assignedSchedule.forEach((schedule) => {
      const currentDate = new Date(schedule.date);

      for (const [shiftName, employeeIds] of Object.entries(schedule.shifts)) {
        const startShift = new Date(currentDate);
        const endShift = new Date(currentDate);

        if (shiftName === "Mañana") {
          startShift.setHours(6, 0, 0, 0);
          endShift.setHours(14, 0, 0, 0);
        } else if (shiftName === "Tarde") {
          startShift.setHours(14, 0, 0, 0);
          endShift.setHours(22, 0, 0, 0);
        } else if (shiftName === "Noche") {
          startShift.setHours(22, 0, 0, 0);
          endShift.setDate(endShift.getDate() + 1);
          endShift.setHours(6, 0, 0, 0);
        }

        // Crear turno
        const newShift = {
          name_shift: shiftName,
          start_date: startShift,
          end_date: endShift,
        };
        const shiftIndex = shiftsToInsert.push(newShift) - 1;

        // Crear asignaciones
        for (const employeeId of employeeIds) {
          assignmentsToInsert.push({
            id_user: employeeId,
            shiftIndex, // Relacionar el índice del turno
          });
        }
      }
    });

    // Insertar turnos en la base de datos
    const insertedShifts = await Shift.insertMany(shiftsToInsert);

    // Actualizar las asignaciones con los IDs de turno reales
    assignmentsToInsert.forEach((assignment) => {
      const shift = insertedShifts[assignment.shiftIndex];
      assignment.id_shift = shift._id;
      delete assignment.shiftIndex;
    });

    // Insertar asignaciones en la base de datos
    const insertedAssignments = await Assignment.insertMany(assignmentsToInsert);

    // Responder con resumen
    return res.status(200).json({
      success: true,
      msg: "Turnos y asignaciones creados exitosamente.",
      data: {
        shiftsCreated: insertedShifts.length,
        assignmentsCreated: insertedAssignments.length,
      },
    });
  } catch (error) {
    console.error("Error en getAutomaticAssignments:", error);
    return res.status(500).json({
      success: false,
      msg: "Error del servidor.",
      error: error.message,
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
