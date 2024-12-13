const Request = require("../models/request");
const User = require("../models/user");
const path = require("path");
const multer = require("multer");
const upload = multer();
const mongoose = require("mongoose");

const createRequest = async (req, res) => {
  const { start_date, end_date, type, title, description, attach, state } = req.body;

  if (!start_date || !end_date || !type || !title || !description) {
    return res.status(400).send({ msg: "Todos los campos obligatorios deben ser completados" });
  }

  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(400).send({ msg: "No se ha encontrado un usuario asociado" });
  }

  const request = new Request({
    start_date,
    end_date,
    type,
    title,
    description,
    attach,
    state,
    id_user: userId,
    create_date: new Date(),
    update_date: new Date(),
  });

  try {
    const requestStorage = await request.save();
    res.status(201).send(requestStorage);
  } catch (error) {
    res.status(400).send({ msg: "Error al crear el request", error });
  }
};

const createRequestAccess = async (req, res) => {
  const { description } = req.body;

  const descriptionF = description.toLowerCase();
  if (!descriptionF) {
    return res.status(400).send({ msg: "No llegó el correo" });
  }

  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];

  const titleF = `Solicitud de Acceso correo: ${description}`;

  const request = new Request({
    start_date: formattedDate,
    end_date: formattedDate,
    type: "Solicitud de Acceso",
    title: titleF,
    description: descriptionF,
    update: new Date(),
  });

  try {
    const requestStorage = await request.save();
    res.status(201).send(requestStorage);
  } catch (error) {
    res.status(400).send({ msg: "Error al crear el request", error });
  }
};

const getRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).send({ msg: "No se encontró la solicitud" });
    }
    res.status(200).send(request);
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor", error: error.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const requests = await Request.find({ id_user: userId });
    if (!requests || requests.length === 0) {
      return res.status(404).send({ msg: "No se encontraron solicitudes para este usuario" });
    }
    res.status(200).send(requests);
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor", error: error.message });
  }
};

const getRequests = async (req, res) => {
  try {
    const requests = await Request.find();
    res.status(200).send(requests);
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor", error: error.message });
  }
};


const updateRequest = async (req, res) => {

  const { id } = req.params;
  
  const { state } = req.body
  
  const updateData = { state, update: new Date() };
  
  const { rol } = req.user;

    if (rol !== "jefe") {
      return res.status(403).send({ msg: "No tienes permisos para acceder a esta información" });
    }

  try {
    const request = await Request.findByIdAndUpdate(id, updateData, { new: true });

    if (!request) {
      return res.status(404).send({ msg: "No se encontró la solicitud" });
    }

    res.status(200).send(request);
  } catch (error) {
    res.status(500).send({ msg: "Error al actualizar la solicitud", error: error.message });
  }
};



const getDepartmentRequests = async (req, res) => {
  try {
    const { rol, _id: userId } = req.user;

    if (rol !== "jefe") {
      return res.status(403).send({ msg: "No tienes permisos para acceder a esta información" });
    }

    const jefe = await User.findById(userId);
    if (!jefe) {
      return res.status(404).send({ msg: "Usuario no encontrado" });
    }

    const department = jefe.id_department;
    if (!department) {
      return res.status(400).send({ msg: "El jefe no tiene un departamento asignado" });
    }

    if (!mongoose.Types.ObjectId.isValid(department)) {
      return res.status(400).send({ msg: "El ID del departamento no es válido" });
    }

    const departmentId = new mongoose.Types.ObjectId(department);
    const usersInDepartment = await User.find({ id_department: departmentId }).select("_id");

    if (!usersInDepartment.length) {
      return res.status(404).send({ msg: "No se encontraron usuarios en este departamento" });
    }

    const userIds = usersInDepartment.map((user) => user._id);
    const requests = await Request.find({ id_user: { $in: userIds } });

    if (!requests.length) {
      return res.status(404).send({ msg: "No se encontraron solicitudes para este departamento" });
    }

    res.status(200).send(requests);
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor", error: error.message });
  }
};


const getDepartmentRequestsUpdate = async (req, res) => {
  try {
    const { rol, _id: userId } = req.user;

    if (rol !== "jefe") {
      return res.status(403).send({ msg: "No tienes permisos para acceder a esta información" });
    }

    // Buscar al jefe logueado
    const jefe = await User.findById(userId);
    if (!jefe) {
      return res.status(404).send({ msg: "Usuario no encontrado" });
    }

    const department = jefe.id_department;
    if (!department) {
      return res.status(400).send({ msg: "El jefe no tiene un departamento asignado" });
    }

    if (!mongoose.Types.ObjectId.isValid(department)) {
      return res.status(400).send({ msg: "El ID del departamento no es válido" });
    }

    const departmentId = new mongoose.Types.ObjectId(department);

    // Buscar usuarios del departamento
    const usersInDepartment = await User.find({ id_department: departmentId }).select("_id");

    if (!usersInDepartment.length) {
      return res.status(404).send({ msg: "No se encontraron usuarios en este departamento" });
    }

    const userIds = usersInDepartment.map((user) => user._id);

    // Buscar las 10 solicitudes más recientes
    const requests = await Request.find({ id_user: { $in: userIds } })
      .sort({ update_date: -1 }) 
      .limit(10);

    if (!requests.length) {
      return res.status(404).send({ msg: "No se encontraron solicitudes para este departamento" });
    }

    res.status(200).send(requests);
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor", error: error.message });
  }
};




module.exports = {
  createRequest: [upload.none(), createRequest],
  createRequestAccess: [upload.none(), createRequestAccess],
  getMyRequests: [upload.none(), getMyRequests],
  getRequest,
  getRequests,
  updateRequest: [upload.none(), updateRequest],
  getDepartmentRequests: [upload.none(), getDepartmentRequests],
  getDepartmentRequestsUpdate: [upload.none(), getDepartmentRequestsUpdate],
};
