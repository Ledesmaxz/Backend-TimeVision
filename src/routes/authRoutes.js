const express = require("express");
const AuthController = require("../controllers/auth");
const multer = require('multer');

const api = express.Router();

api.post("/login", AuthController.login);
const upload = multer({ storage: multer.memoryStorage() });
api.post("/register", upload.single('photo'), AuthController.register);
api.post("/refresh_access_token", AuthController.refreshAccessToken);

module.exports = api;
