const express = require("express");
const request = require("../controllers/requests");

const api= express.Router()

api.post("/createRequest", request.createRequest);
api.get("/request/:id", request.getRequest);
api.get("/requests", request.getRequests);

module.exports = api;
