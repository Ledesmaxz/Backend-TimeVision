const express = require("express");
const assignment= require("../controllers/assignment");

const api= express.Router()

api.post("/createAssignment", assignment.createAssignment);
api.put("/:id",  assignment.updateAssignment);
api.get("/assignment/me", assignment.getAssignment);
api.get("/assignment", assignment.getAssignmentes);
api.delete("/:id",  assignment.deleteAssignment);

module.exports = api;
