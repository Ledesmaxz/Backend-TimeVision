const Asignacion = require("../models/asignacion");

const createAsignacion = async (req, res) => {
  try {
    const asignacionData = req.body;
    const asignacion = new Asignacion(asignacionData);

    const asignacionStored = await asignacion.save();
    res.status(201).send(asignacionStored);
  } catch (error) {
    res
      .status(400)
      .send({ msg: "Error al crear la asignación", error: error.message });
  }
};

const getAsignacion = async (req, res) => {
  try {
    const { id } = req.params;
    const asignacion = await Asignacion.findById(id);

    if (!asignacion) {
      return res.status(404).send({ msg: "No se encontró la asignación" });
    }
    res.status(200).send(asignacion);
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor", error: error.message });
  }
};

const getAsignaciones = async (req, res) => {
  try {
    const asignaciones = await Asignacion.find();
    res.status(200).send(asignaciones);
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor", error: error.message });
  }
};

const updateAsignacion = async (req, res) => {
  try {
    const { id } = req.params;
    const asignacionData = req.body;

    const asignacionUpdated = await Asignacion.findByIdAndUpdate(
      { _id: id },
      asignacionData,
      { new: true }
    );

    if (!asignacionUpdated) {
      return res
        .status(404)
        .send({ msg: "No se encontró la asignación para actualizar" });
    }
    res.status(200).send(asignacionUpdated);
  } catch (error) {
    res
      .status(400)
      .send({ msg: "Error al actualizar la asignación", error: error.message });
  }
};

const deleteAsignacion = async (req, res) => {
  try {
    const { id } = req.params;

    const asignacionDeleted = await Asignacion.findByIdAndDelete(id);

    if (!asignacionDeleted) {
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
  createAsignacion,
  getAsignacion,
  getAsignaciones,
  updateAsignacion,
  deleteAsignacion,
};
