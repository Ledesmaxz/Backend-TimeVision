const express = require("express");
const departament = require("../controllers/departament");
const { asureAuth } = require("../middleware/authenticated");

const api= express.Router()

api.post("/create", departament.createDepartament);
api.get("/:id",asureAuth,  departament.getDepartment);
api.put("/:id",  departament.updateDepartament);

module.exports = api;
