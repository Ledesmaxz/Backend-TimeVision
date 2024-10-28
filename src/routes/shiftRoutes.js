const express = require("express");
const shift = require("../controllers/shift");
const { asureAuth } = require("../middleware/authenticated");

const api= express.Router()

api.post("/create", shift.createShift);
api.put("/:id",  shift.updateShift);
api.get("/:id", shift.getShift);
api.post("/date", asureAuth, shift.getShiftsByDate);
api.get("/shifts", shift.getShifts);

module.exports = api;
