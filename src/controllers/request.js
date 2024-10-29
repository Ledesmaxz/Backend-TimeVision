const Request = require("../models/request");
const User = require("../models/user");
const multer = require("multer");
const upload = multer();
const { uploadFile } = require("../utils/upload");

const createRequest = async (req, res) => {
  const { start_date, end_date, type, title, description, state } = req.body;
  const file = req.file; 

  if (!start_date || !end_date || !type || !title || !description) {
    return res.status(400).send({ msg: "Todos los campos obligatorios deben ser completados" });
  }

  const userId = req.user._id;
  const response = await User.findById(userId);
  
  if (!response) {
    return res.status(400).send({ msg: "No se ha encontrado un usuario asociado" });
  }

  let attachUrl = null;
  if (file) {
    const shortDate = new Date().toISOString().split("T")[0];
    const newFileName = `excusa-medica-${shortDate}-${userId}${path.extname(file.originalname)}`;

    try {
      attachUrl = await uploadFile(process.env.GOOGLE_CLOUD_BUCKET_NAME, file.buffer, newFileName, file.mimetype);
      console.log("Archivo subido exitosamente:", attachUrl);
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      return res.status(500).send({ msg: "Error al subir el archivo adjunto", error });
    }
  }

  const request = new Request({
    start_date,
    end_date,
    type,
    title,
    description,
    attach: attachUrl, 
    state,
    id_user: userId
  });
  
  try {
    const requestStorage = await request.save();
    res.status(201).send(requestStorage);
  } catch (error) {
    console.error("Error al guardar la solicitud:", error);
    res.status(400).send({ msg: "Error al crear el request", error });
  }
};


const createRequestAccess = async (req, res) => {
  const {  
    description
  } = req.body;
  console.log(req.body);
  const descriptionF = description.toLowerCase()
  if (!descriptionF ) {
    return res.status(400).send({ msg: "No llego el correo" });
  }
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];  

  const titleF = `Solicitud de Acceso correo: ${description}`

  const request = new Request({
      start_date: formattedDate,
      end_date: formattedDate,
      type: "Solicitud de Acceso",
      title: titleF,
      description: descriptionF,
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
    const Request = await Request.findById(id);

    if (!Request) {
      return res.status(404).send({ msg: "No se encontró la Request" });
    }
    res.status(200).send(Request);
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

const getMyRequestsByDate = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date } = req.body;
    if (!date) {
      return res.status(400).send({ msg: "La fecha es obligatoria" });
    }


    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const requests = await Request.find({
      id_user: userId,
      start_date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (!requests || requests.length === 0) {
      return res.status(404).send({ msg: "No se encontraron solicitudes para este usuario en la fecha indicada" });
    }

    res.status(200).send(requests);
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor", error: error.message });
  }
};


const getRequests = async (req, res) => {
  try {
    const Requestes = await Request.find();
    res.status(200).send(Requestes);
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor", error: error.message });
  }
};

module.exports = {
  createRequest: [upload.none(), createRequest],
  getMyRequests: [upload.none(), getMyRequests],
  getMyRequestsByDate: [upload.none(), getMyRequestsByDate],
  getRequest,
  getRequests,
  createRequestAccess: [upload.none(), createRequestAccess],
};
