const express = require("express");
const multiparty = require("connect-multiparty");
const UserController = require("../controllers/user");
const fs = require("fs");
const uploadDir = "./uploads/avatar";
const { asureAuth } = require("../middleware/authenticated");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const md_upload = multiparty({ uploadDir: uploadDir });
const api= express.Router()

api.post("/createuser", UserController.createUser);
api.put("/:id",  UserController.updateUser);
api.delete("/:id",  UserController.deleteUser);
api.get("/me", asureAuth, UserController.getMe);
api.post("/changepassword", asureAuth, UserController.changePassword);
api.get("/users", UserController.getUsers);
api.get("/:id", UserController.getUser);

module.exports = api;
 