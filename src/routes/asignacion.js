const express = require("express");
const asignacion= require("../controllers/asignacion");

const api= express.Router()

api.post("/createAsignacion", asignacion.createAsignacion);
api.put("/:id",  asignacion.updateAsignacion);
api.get("/asignacion/me", asignacion.getAsignacion);
api.get("/asignacion", asignacion.getAsignaciones);
api.delete("/:id",  asignacion.deleteAsignacion);

module.exports = api;
