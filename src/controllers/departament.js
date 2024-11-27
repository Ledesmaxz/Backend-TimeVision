const Departamento = require("../models/departament");
const multer = require("multer");
const upload = multer();

const createDepartament = async (req, res) => {
  const { 
    name,
    id_company, 
  } = req.body;

  if (!name || !id_company ) {
    return res.status(400).send({ msg: "Todos los campos obligatorios deben ser completados" });
  }


  const deparment = new Departamento({
    name,
    id_company,
  });

  try {
    const deparmentStorage = await deparment.save();
    res.status(201).send(deparmentStorage);
  } catch (error) {
    res.status(400).send({ msg: "Error al crear el deparmento", error });
  }
};

//No funcional ni probada
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
  createDepartament:[upload.none(), createDepartament],
  updateDepartament,
};
