const express = require("express");

const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("../utils/jwt");
const multer = require("multer");
const { uploadFile } = require('../utils/upload');
const path = require("path");
const upload = multer({ storage: multer.memoryStorage() });
const NodeRSA = require("node-rsa");
const fs = require("fs");
const { Buffer } = require('buffer');
const { sendResetPasswordEmail, generateResetCode } = require('../sendEmail/send-email');



const register = async (req, res) => {
  console.log("Campos de formulario:", req.body); 
  console.log("Archivo recibido:", req.file); 
  const { name, lastname, password, email, num_doc, type_doc, telephone, position, id_department, id_boss, active } = req.body;

  const file = req.file;
  if (!file) {
    return res.status(400).send({ msg: 'La foto es requerida.' });
  }

  if (!name || !lastname || !password || !email || !num_doc) {
    return res.status(400).send({
      msg: 'Todos los campos obligatorios deben ser completados',
    });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).send({ msg: 'Ya existe un usuario con ese email' });
  }

  const existingUserByDoc = await User.findOne({ num_doc: num_doc });
  if (existingUserByDoc) {
    return res.status(400).send({ msg: 'Ya existe un usuario con ese documento' });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashPassword = bcrypt.hashSync(password, salt);

  const fileName = `${num_doc}-profile-image${path.extname(file.originalname)}`;

  try {
    const imageUrl = await uploadFile(process.env.GOOGLE_CLOUD_BUCKET_NAME, file.buffer, fileName, file.mimetype);
    console.log("Imagen subida exitosamente:", imageUrl);
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

    const userStorage = await user.save();
    res.status(201).send(userStorage);
  } catch (error) {
    console.error("Error al subir la imagen o guardar el usuario:", error);
    res.status(500).send({ msg: 'Error al subir la imagen o guardar el usuario', error });
  }
};


const foto = async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ msg: "No se recibió ningún archivo" });
  }

  try {
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
    const imageUrl = await uploadFile(bucketName, req.file.buffer, fileName, req.file.mimetype);
    
    console.log("Archivo subido a Google Cloud Storage:", imageUrl);
    
    res.send({
      msg: "Archivo subido correctamente a Google Cloud Storage",
      url: imageUrl
    });
  } catch (error) {
    console.error("Error al subir el archivo a Google Cloud Storage:", error);
    res.status(500).send({ msg: "Error al subir la imagen a Google Cloud Storage", error });
  }
};



const login = async (req, res) => {
  const { email, password } = req.body;

  try {
  if (!email || !password) {
      throw new Error("El email y la contraseña son requeridos");
  }
  const emailLowerCase = email.toLowerCase();
  const userStore = await User.findOne({ email: emailLowerCase }).exec()
  if (!userStore) {
      return res.status(401).send({ msg: 'Usuario o contraseña incorrectos' });
  }
  const check = await bcrypt.compare(password, userStore.password)
  if (!check) {
      return res.status(401).send({ msg: 'Usuario o contraseña incorrectos' });
  }
  if (!userStore.active) {
      return res.status(401).send({ msg: 'Cuenta inactiva' });
  }
  if (userStore.disabled) {
      return res.status(401).send({ msg: 'Usuario o contraseña incorrectos' });
  }
  res.status (200).send({
      access: jwt.createAccessToken (userStore),
      refresh: jwt.createRefreshToken (userStore),
  });
  } catch (error){
      res.status (400).send({ msg: error.message });
  }
}


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

const requestPasswordReset = async (req, res) => {
  try {
    console.log('Recibida solicitud de reset para:', req.body.email);
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('Usuario no encontrado:', email);
      return res.status(404).send({ msg: "Verifica tu correo para restablecer tu contraseña" });
    }

    console.log('Usuario encontrado, generando código...');
    const resetCode = generateResetCode();
    const resetCodeExpiry = Date.now() + 3600000; // 1 hora

    user.resetPasswordToken = resetCode;
    user.resetPasswordExpiry = resetCodeExpiry;
    await user.save();
    console.log('Código guardado en base de datos:', resetCode);

    const emailSent = await sendResetPasswordEmail(email, resetCode);
    console.log('Resultado del envío:', emailSent);
    
    if (!emailSent) {
      throw new Error('Error al enviar el correo');
    }

    res.status(200).send({ 
      msg: "Si el correo existe, recibirás instrucciones para restablecer tu contraseña" 
    });

  } catch (error) {
    console.error('Error completo en recuperación de contraseña:', error);
    res.status(500).send({ 
      msg: "Error al procesar la solicitud" 
    });
  }
};

const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    console.log('Verificando código para:', email, 'Código:', code);

    const user = await User.findOne({ 
      email: email.toLowerCase(),
      resetPasswordToken: code,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      console.log('Código inválido o expirado');
      return res.status(400).send({ 
        msg: "Código inválido o expirado" 
      });
    }

    console.log('Código verificado exitosamente');
    res.status(200).send({ 
      msg: "Código verificado correctamente" 
    });

  } catch (error) {
    console.error('Error en verificación de código:', error);
    res.status(500).send({ 
      msg: "Error al verificar el código" 
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    console.log('Restableciendo contraseña para:', email);

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      console.log('Token inválido o expirado');
      return res.status(400).send({ msg: "Token inválido o expirado" });
    }

    if (!newPassword) {
      console.log('Nueva contraseña no proporcionada');
      return res.status(400).send({ msg: "Nueva contraseña requerida" });
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    console.log('Contraseña actualizada exitosamente');
    res.status(200).send({ msg: "Contraseña actualizada correctamente" });

  } catch (error) {
    console.error('Error completo en restablecimiento de contraseña:', error);
    res.status(500).send({ msg: "Error al restablecer la contraseña" });
  }
};

module.exports = {
  register,
  login: [upload.none(), login],
  foto,
  refreshAccessToken,
  requestPasswordReset: [upload.none(), requestPasswordReset],
  verifyResetCode: [upload.none(), verifyResetCode],
  resetPassword
};
