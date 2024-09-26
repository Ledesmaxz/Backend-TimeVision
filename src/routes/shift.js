const express = require("express");
const shift = require("../controllers/shift");

const api= express.Router()

api.post("/create", shift.createShift);
api.put("/:id",  shift.updateShift);
api.get("/shift/me", shift.getShift);
api.get("/shifts", shift.getShifts);

module.exports = api;
