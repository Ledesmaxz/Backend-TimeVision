const Departamento = require("../models/departament");

const createDepartament = async (req, res) => {
  try {
    const departamentData = req.body;
    const departamento = new Departamento(departamentData);

    const departamentoStored = await departamento.save();
    res.status(201).send(departamentoStored);
  } catch (error) {
    res
      .status(400)
      .send({ msg: "Error al crear el departamento", error: error.message });
  }
};

const getDepartament = async (req, res) => {
  try {
    const { id } = req.params;
    const departamento = await Departamento.findById(id);

    if (!departamento) {
      return res.status(404).send({ msg: "No se encontró el departamento" });
    }
    res.status(200).send(departamento);
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor", error: error.message });
  }
};

const updateDepartament = async (req, res) => {
  try {
    const { id } = req.params;
    const departamentData = req.body;

    const departamentoUpdated = await Departamento.findByIdAndUpdate(
      { _id: id },
      departamentData,
      { new: true }
    );

    if (!departamentoUpdated) {
      return res
        .status(404)
        .send({ msg: "No se encontró el departamento para actualizar" });
    }
    res.status(200).send(departamentoUpdated);
  } catch (error) {
    res
      .status(400)
      .send({
        msg: "Error al actualizar el departamento",
        error: error.message,
      });
  }
};

module.exports = {
  createDepartament,
  getDepartament,
  updateDepartament,
};
