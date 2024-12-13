const express = require("express");
const UserController = require("../controllers/user");
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { asureAuth } = require("../middleware/authenticated");

const api= express.Router()

api.post("/createuser", asureAuth, UserController.createUser);
api.patch("/update/:id", asureAuth,  UserController.updateUser);
api.post("/photo", asureAuth, upload.single("photo"), UserController.updatePhoto);
api.get("/me", asureAuth, UserController.getMe);
api.get("/statususers", asureAuth, UserController.getStatusUsers);
api.post("/changepassword", asureAuth, UserController.changePassword);
api.get("/usersDepartment", asureAuth, UserController.getUsersDepartment);
api.post("/photo", asureAuth, upload.single("photo"), UserController.updatePhoto);
api.get("/:id", UserController.getUser);


module.exports = api;
