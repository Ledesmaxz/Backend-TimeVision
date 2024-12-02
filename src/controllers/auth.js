const express = require("express");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("../utils/jwt");
const uploadFile = require("../utils/upload");
const NodeRSA = require("node-rsa");
const fs = require("fs");

const upload = multer();

const register = async (req, res) => {
  const {
    name,
    lastname,
    password,
    email,
    num_doc,
    type_doc,
    telephone,
    photo,
    position,
    id_department,
    id_boss,
    active,
  } = req.body;

  const file = req.file;
  if (!file) {
    return res.status(400).send({ msg: "La foto es requerida." });
  }

  console.log(req.body);
  if (!name || !lastname || !password || !email || !num_doc) {
    return res
      .status(400)
      .send({ msg: "Todos los campos obligatorios deben ser completados" });
  }

  if (!password) {
    return res.status(400).send({ msg: "La contraseña es requerida" });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).send({ msg: "Ya existe un usuario con ese email" });
  }

  const existingUserByDoc = await User.findOne({ num_doc: num_doc });
  if (existingUserByDoc) {
    return res
      .status(400)
      .send({ msg: "Ya existe un usuario con ese documento" });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashPassword = bcrypt.hashSync(password, salt);

  const textoURL = `${num_doc}-profile-image`;
  const imageUrl = await uploadFile(file, textoURL);

  const user = new User({
    name,
    lastname,
    email: email.toLowerCase(),
    password: hashPassword,
    num_doc,
    type_doc,
    telephone,
    photo: imageUrl,
    position,
    id_department,
    id_boss,
    active,
  });

  try {
    const userStorage = await user.save();
    res.status(201).send(userStorage);
  } catch (error) {
    res.status(400).send({ msg: "Error al crear el usuario", error });
  }
};

const login = async (req, res) => {
  const privateKey = process.env.PRIVATE_KEY;

  const key = new NodeRSA(privateKey);
  key.setOptions({ encryptionScheme: "pkcs1" });

  const { email, password, notification_token } = req.body;

  try {
    if (!email || !password) {
      throw new Error("El email y la contraseña son requeridos");
    }

    const emailLowerCase = email.toLowerCase();
    const userStore = await User.findOne({ email: emailLowerCase }).exec();
    if (!userStore) {
      return res.status(401).send({ msg: "Usuario o contraseña incorrectos" });
    }

    const decrypted = key.decrypt(password, "utf8");
    const check = await bcrypt.compare(decrypted, userStore.password);

    if (!check) {
      return res.status(401).send({ msg: "Usuario o contraseña incorrectos" });
    }

    if (!userStore.active) {
      return res.status(401).send({ msg: "Cuenta inactiva" });
    }

    if (userStore.disabled) {
      return res.status(401).send({ msg: "Usuario o contraseña incorrectos" });
    }

    if (notification_token) {
      userStore.notification_token = notification_token;
      await userStore.save();
    }

    res.status(200).send({
      access: jwt.createAccessToken(userStore),
      refresh: jwt.createRefreshToken(userStore),
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({ msg: error.message });
  }
};

const refreshAccessToken = (req, res) => {
  const { token } = req.body;
  if (!token) res.status(400).send({ msg: "Token requerido" });
  const { _id } = jwt.decoded(token);
  User.findOne({ _id: _id }, (error, userStorage) => {
    if (error) {
      res.status(500).send({ msg: "Error del servidor" });
    } else {
      res.status(200).send({
        accesToken: jwt.createAccessToken(userStorage),
      });
    }
  });
};

module.exports = {
  register: [upload.none(), register],
  login: [upload.none(), login],
  refreshAccessToken,
};
