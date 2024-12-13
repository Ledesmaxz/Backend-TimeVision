const express = require("express");
const AuthController = require("../controllers/auth");
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const api = express.Router();

api.post("/foto", upload.single("photo"), AuthController.foto);
api.post("/login", AuthController.login);
api.post("/register", upload.single('photo'), AuthController.register);
api.post("/refresh_access_token", AuthController.refreshAccessToken);
api.post("/forgot-password", AuthController.requestPasswordReset);
api.post("/reset-password/verify", AuthController.verifyResetCode);
api.post("/reset-password", AuthController.resetPassword);

module.exports = api;
