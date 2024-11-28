const express = require("express");
const request = require("../controllers/request");
const { asureAuth } = require("../middleware/authenticated");

const api= express.Router()

api.post("/", asureAuth, request.createRequest);
api.post("/access", request.createRequestAccess);
api.get("/me", asureAuth, request.getMyRequests);
//api.get("/:id", request.getRequest);
api.patch("/update/:id", asureAuth, request.updateRequest);
api.get("/requests", request.getRequests);
api.get("/requestsDeparment", asureAuth, request.getDepartmentRequests);

module.exports = api;
