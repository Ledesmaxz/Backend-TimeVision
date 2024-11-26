const Request = require("../models/request");
const User = require("../models/user");
const multer = require("multer");
const upload = multer();

const createRequest = async (req, res) => {
  const { 
    start_date,
    end_date, 
    type, 
    title, 
    description, 
    attach, 
    state 
  } = req.body;

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
    update: new Date(), 
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
  const formattedDate = today.toISOString().split('T')[0];

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
  const updateData = { ...req.body, update: new Date() };

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

module.exports = {
  createRequest: [upload.none(), createRequest],
  createRequestAccess: [upload.none(), createRequestAccess],
  getMyRequests: [upload.none(), getMyRequests],
  getRequest,
  getRequests,
  updateRequest, 
};
