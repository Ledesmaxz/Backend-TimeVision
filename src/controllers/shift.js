const Shift = require("../models/shift");
const multer = require("multer");
const upload = multer();
const Assignment = require("../models/assignment");

const createShift = async (req, res) => {
  const { 
    time_start,
    time_end, 
    name_shift, 
    start_date, 
    end_date
  } = req.body;

  if (!start_date || !end_date || !time_start || !time_end || !name_shift ) {
    return res.status(400).send({ msg: "Todos los campos obligatorios deben ser completados" });
  }

  const startDate = new Date(start_date);
  const [startHour, startMinute] = time_start.split(':');
  startDate.setUTCHours(parseInt(startHour), parseInt(startMinute), 0, 0);

  const endDate = new Date(start_date);
  const [endHour, endMinute] = time_end.split(':');
  endDate.setUTCHours(parseInt(endHour), parseInt(endMinute), 0, 0);

  const shift = new Shift({
    name_shift, 
    start_date: startDate, 
    end_date: endDate
  });

  try { 
    const shiftStored = await shift.save();
    res.status(201).send(shiftStored);
  } catch (error) {
    res.status(400).send({ msg: "Error al crear el Shift", error: error.message });
  }
};





const getShift = async (req, res) => {
  try {
    const { id } = req.params; 
    const response = await Shift.findById(id); 
    if (!response) {
      return res.status(400).send({ msg: "No se ha encontrado el turno" });
    }
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ msg: "Error desconocido. Intenta más tarde" });
  }
};


const getShifts = async (req, res) => {
  try {
    const Shifts = await Shift.find();
    res.status(200).send(Shifts);
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor", error: error.message });
  }
};

const getShiftsByDate = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date } = req.body;

    if (!date) {
      return res.status(400).send({ msg: "La fecha es obligatoria" });
    }

    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const assignments = await Assignment.find({
      id_user: userId,
      time_start: { $lte: endOfDay },
      time_end: { $gte: startOfDay }
    });

    if (!assignments || assignments.length === 0) {
      return res.status(404).send({ msg: "No se encontraron turnos para este usuario en la fecha indicada" });
    }

    const shiftIds = assignments.map(assignment => assignment.id_shift);
    const shifts = await Shift.find({ _id: { $in: shiftIds } });

    res.status(200).send(shifts);
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor", error: error.message });
  }
};



const updateShift = async (req, res) => {
  try {
    const { id } = req.params;
    const ShiftData = req.body;

    const ShiftUpdated = await Shift.findByIdAndUpdate({ _id: id }, ShiftData, {
      new: true,
    });

    if (!ShiftUpdated) {
      return res
        .status(404)
        .send({ msg: "No se encontró el Shift para actualizar" });
    }
    res.status(200).send(ShiftUpdated);
  } catch (error) {
    res
      .status(400)
      .send({ msg: "Error al actualizar el Shift", error: error.message });
  }
};

module.exports = {
  createShift: [upload.none(), createShift],
  getShiftsByDate : [upload.none(), getShiftsByDate],
  getShift,
  getShifts,
  updateShift,
};
