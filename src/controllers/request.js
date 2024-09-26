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
    state, 
    id_user,
  } = req.body;
  console.log(req.body);
  if (!start_date || !end_date || !type || !title || !description || !attach || !state || !id_user) {
    return res.status(400).send({ msg: "Todos los campos obligatorios deben ser completados" });
  }

  const existingUser = await User.findOne({ _id: id_user });
  if (!existingUser) {
      return res.status(400).send({ msg: 'No existe el usuario' });
  }

  const request = new Request({
      start_date,
      end_date,
      type,
      title,
      description,
      attach,
      state,
      id_user
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
  getRequest,
  getRequests,
};
