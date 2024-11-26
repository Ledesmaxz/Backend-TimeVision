const Compania = require("../models/company");

const createCompany = async (req, res) => {
  try {
    const CompanyData = req.body;
    const compania = new Compania(CompanyData);

    const CompaniaStored = await compania.save();
    res.status(201).send(CompaniaStored);
  } catch (error) {
    res
      .status(400)
      .send({ msg: "Error al crear el Compania", error: error.message });
  }
};

const getCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const Compania = await Compania.findById(id);

    if (!Compania) {
      return res.status(404).send({ msg: "No se encontró el Compania" });
    }
    res.status(200).send(Compania);
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor", error: error.message });
  }
};

const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const CompanyData = req.body;

    const CompaniaUpdated = await Compania.findByIdAndUpdate(
      { _id: id },
      CompanyData,
      { new: true }
    );

    if (!CompaniaUpdated) {
      return res
        .status(404)
        .send({ msg: "No se encontró el Compania para actualizar" });
    }
    res.status(200).send(CompaniaUpdated);
  } catch (error) {
    res
      .status(400)
      .send({
        msg: "Error al actualizar el Compania",
        error: error.message,
      });
  }
};

module.exports = {
  createCompany,
  getCompany,
  updateCompany,
};
