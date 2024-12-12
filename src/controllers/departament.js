const departament = require("../models/departament");
const User = require("../models/user");
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


  const deparment = new departament({
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

const getDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId= req.user._id;
    const response = await User.findById(userId);
    if(!response){
        return res.status(400).send({msg: "No se ha encontrado usuario"});
    }
    const Departament = await departament.findById(id);

    if (!Departament) {
      return res.status(404).send({ msg: "No se encontró el departament" });
    }
    res.status(200).send(Departament);
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor", error: error.message });
  }
};

const getDepartments = async (req, res) => {
  try {
    const { rol, _id: adminId } = req.user;

    if (rol !== "jefe") {
      return res.status(403).send({ 
        msg: "No tienes permisos para consultar departamentos. Se requiere rol de jefe" 
      });
    }

    const admin = await User.findById(adminId);
    if (!admin || !admin.id_department) {
      return res.status(404).send({ msg: "Usuario jefe o su empresa no encontrada" });
    }

    const department = await departament.findById(admin.id_department);
    if (!department) {
      return res.status(404).send({ msg: "Departamento no encontrado" });
    }

    const companyId = department.id_company;
    const listDepartments = await departament.find({ id_company: companyId })
    
    if (!listDepartments || listDepartments.length === 0) {
      return res.status(404).send({ msg: "No se encontraron departamentos para la empresa del jefe" });
    }

    res.status(200).send({ 
      msg: "Departamentos encontrados exitosamente", 
      listDepartments 
    });
  } catch (error) {
    console.error("Error en getDepartments:", error);
    res.status(500).send({ msg: "Error del servidor", error: error.message });
  }
};


//No funcional ni probada
const updateDepartament = async (req, res) => {
  try {
    const { id } = req.params;
    const departamentData = req.body;

    const departamentoUpdated = await departament.findByIdAndUpdate(
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
  getDepartment:[upload.none(), getDepartment],
  getDepartments,
};
