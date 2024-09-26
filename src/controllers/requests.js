const Solicitud = require("../models/requests");

const createRequest = async (req, res) => {
  try {
    const requestData = req.body;
    const solicitud = new Solicitud(requestData);

    if (req.files && req.files.adjunto) {
      const adjuntoPath = req.files.adjunto.path;
      solicitud.adjunto = adjuntoPath;
    }

    const solicitudStored = await solicitud.save();
    res.status(201).send(solicitudStored);
  } catch (error) {
    res
      .status(400)
      .send({ msg: "Error al crear la solicitud", error: error.message });
  }
};

const getRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitud = await Solicitud.findById(id);

    if (!solicitud) {
      return res.status(404).send({ msg: "No se encontró la solicitud" });
    }
    res.status(200).send(solicitud);
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor", error: error.message });
  }
};

const getRequests = async (req, res) => {
  try {
    const solicitudes = await Solicitud.find();
    res.status(200).send(solicitudes);
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor", error: error.message });
  }
};

module.exports = {
  createRequest,
  getRequest,
  getRequests,
};
