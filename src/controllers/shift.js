const Shift = require("../models/shift");

const createShift = async (req, res) => {
  try {
    const ShiftData = req.body;
    const Shift = new Shift(ShiftData);

    const ShiftStored = await Shift.save();
    res.status(201).send(ShiftStored);
  } catch (error) {
    res
      .status(400)
      .send({ msg: "Error al crear el Shift", error: error.message });
  }
};

const getShift = async (req, res) => {
  try {
    const { _id } = req.Shift;
    const response = await User.findById(_id);
    if (!response) {
      return res.status(400).send({ msg: "No se ha encontrado usuario" });
    }
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ msg: "Error desconcido. Intenta mas tarde" });
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
  createShift,
  getShift,
  getShifts,
  updateShift,
};
