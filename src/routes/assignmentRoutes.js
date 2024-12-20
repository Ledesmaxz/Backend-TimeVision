const express = require("express");
const assignment= require("../controllers/assignment");
const { asureAuth } = require("../middleware/authenticated");

const api= express.Router()

api.post("/create", assignment.createAssignment);
api.put("/:id",  assignment.updateAssignment);
api.post("/automaticassignment", asureAuth, assignment.getAutomaticAsignments);
api.get("/me", asureAuth, assignment.getMyAssignments);
api.get("/DepartmentAssignments", asureAuth, assignment.getDepartmentAssignments);
api.get("/assignment/me", assignment.getAssignment);
api.get("/assignment", assignment.getAssignmentes);
api.delete("/:id",  assignment.deleteAssignment);

module.exports = api;
