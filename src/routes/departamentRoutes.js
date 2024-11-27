const express = require("express");
const departament = require("../controllers/departament");

const api= express.Router()

api.post("/create", departament.createDepartament);
api.put("/:id",  departament.updateDepartament);

module.exports = api;
