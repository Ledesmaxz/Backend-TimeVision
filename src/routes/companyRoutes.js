const express = require("express");
const company = require("../controllers/company");

const api= express.Router()

api.post("/create", company.createCompany);
api.put("/:id",  company.updateCompany);
api.get("/me", company.getCompany);

module.exports = api;
