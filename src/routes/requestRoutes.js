const express = require("express");
const request = require("../controllers/request");
const { asureAuth } = require("../middleware/authenticated");

const api= express.Router()

api.post("/", asureAuth, request.createRequest);
api.post("/access", request.createRequestAccess);
api.get("/me", asureAuth, request.getMyRequests);
api.get("/meTime", asureAuth, request.getMyRequests);
api.get("/:id", request.getRequest);
api.get("/requests", request.getRequests);

module.exports = api;
