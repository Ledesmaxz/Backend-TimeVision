const Compania = require("../models/company");
const multer = require("multer");
const upload = multer();

const createCompany = async (req, res) => {
  console.log("esta aaca");
  
  const { 
    name,
  } = req.body;
  console.log(req.body);
  
  if (!name) {
    return res.status(400).send({ msg: "Todos los campos obligatorios deben ser completados" });
  }


  const company = new Compania({
    name,
  });

  try {
    const companyStorage = await company.save();
    res.status(201).send(companyStorage);
  } catch (error) {
    res.status(400).send({ msg: "Error al crear la empresa", error });
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
  createCompany :[upload.none(), createCompany],
  getCompany,
  updateCompany,
};
