const bcrypt = require("bcryptjs");
const User = require("../models/user");
require("dotenv").config();

const register = async (req, res) => {
    const { name, lastname, password, email, num_doc, telephone, photo, cargo, id_departament, id_jefe, state } = req.body;

    if (!password) {
        return res.status(400).send({ msg: "La contraseña es requerida" });
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
        return res.status(400).send({ msg: 'Ya existe un usuario con ese email' });
    }

    const existingUser2 = await User.findOne({ num_doc: num_doc });
    if (existingUser2) {
        return res.status(400).send({ msg: 'Ya existe un usuario con ese documento' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);

    const user = new User({
        name,
        lastname,
        email: email.toLowerCase(),
        password: hashPassword,
        num_doc,
        telephone,
        photo,
        cargo,
        id_departament,
        id_jefe,
        state,
    });

    try {
        const userStorage = await user.save();
        res.status(201).send(userStorage);
    } catch (error) {
        res.status(400).send({ msg: "Error al crear el usuario", error });
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
        throw new Error("El usuario no existe");
    }
    const check = await bcrypt.compare(password, userStore.password)
    if (!check) {
        throw new Error("Contraseña incorrecta");
    }
    if (!userStore.state) {
        throw new Error("Usuario no autorizado o no activo");
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


module.exports = {
  register,
  login,
  refreshAccessToken,
};
