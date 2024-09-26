const Turno = require("../models/turno");

const createTurno = async (req, res) => {
  try {
    const turnoData = req.body;
    const turno = new Turno(turnoData);

    const turnoStored = await turno.save();
    res.status(201).send(turnoStored);
  } catch (error) {
    res
      .status(400)
      .send({ msg: "Error al crear el turno", error: error.message });
  }
};

const getTurno = async (req, res) => {
  try {
    const { _id } = req.Turno;
    const response = await User.findById(_id);
    if (!response) {
      return res.status(400).send({ msg: "No se ha encontrado usuario" });
    }
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ msg: "Error desconcido. Intenta mas tarde" });
  }
};

const getTurnos = async (req, res) => {
  try {
    const turnos = await Turno.find();
    res.status(200).send(turnos);
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor", error: error.message });
  }
};

const updateTurno = async (req, res) => {
  try {
    const { id } = req.params;
    const turnoData = req.body;

    const turnoUpdated = await Turno.findByIdAndUpdate({ _id: id }, turnoData, {
      new: true,
    });

    if (!turnoUpdated) {
      return res
        .status(404)
        .send({ msg: "No se encontró el turno para actualizar" });
    }
    res.status(200).send(turnoUpdated);
  } catch (error) {
    res
      .status(400)
      .send({ msg: "Error al actualizar el turno", error: error.message });
  }
};

module.exports = {
  createTurno,
  getTurno,
  getTurnos,
  updateTurno,
};
