const express = require("express");
const departament = require("../controllers/departament");

const api= express.Router()

api.post("/createDepartament", departament.createDepartament);
api.put("/:id",  departament.updateDepartament);
api.get("/departament/me", departament.getDepartament);

module.exports = api;
