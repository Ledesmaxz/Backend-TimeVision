const express = require("express");
const request = require("../controllers/request");

const api= express.Router()

api.post("/", request.createRequest);
api.get("/:id", request.getRequest);
api.get("/requests", request.getRequests);

module.exports = api;
