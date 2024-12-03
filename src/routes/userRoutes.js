const express = require("express");
const UserController = require("../controllers/user");
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { asureAuth } = require("../middleware/authenticated");
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const api= express.Router()

api.post("/createuser", UserController.createUser);
api.put("/:id",  UserController.updateUser);
api.post("/photo", asureAuth, upload.single("photo"), UserController.updatePhoto);
api.delete("/:id",  UserController.deleteUser);
api.get("/me", asureAuth, UserController.getMe);
api.post("/changepassword", asureAuth, UserController.changePassword);
api.get("/usersDepartment", asureAuth, UserController.getUsersDepartment);
api.post("/photo", asureAuth, upload.single("photo"), UserController.updatePhoto);
api.get("/:id", UserController.getUser);

module.exports = api;
