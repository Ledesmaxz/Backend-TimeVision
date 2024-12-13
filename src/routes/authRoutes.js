const express = require("express");
const AuthController = require("../controllers/auth");
const multer = require('multer');

const api = express.Router();

const upload = multer({
    storage: multer.memoryStorage(), 
    limits: { fileSize: 10 * 1024 * 1024 }, 
});

api.post("/register", upload.single('photo'), AuthController.register);
api.post("/login", AuthController.login);
api.post("/refresh_access_token", AuthController.refreshAccessToken);
api.post("/forgot-password", AuthController.requestPasswordReset);
api.post("/reset-password/verify", AuthController.verifyResetCode);
api.post("/reset-password", AuthController.resetPassword);

module.exports = api;
