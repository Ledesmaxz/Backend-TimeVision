const express = require("express");
const turno = require("../controllers/turno");

const api= express.Router()

api.post("/create", turno.createTurno);
api.put("/:id",  turno.updateTurno);
api.get("/turno/me", turno.getTurno);
api.get("/turnos", turno.getTurnos);

module.exports = api;
