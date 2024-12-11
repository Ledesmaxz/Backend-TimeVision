const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("../utils/jwt");
const multer = require("multer");
const upload = multer();

const createUser = async (req, res) => {
    const { rol, _id: userId } = req.user;

    if (rol !== "jefe") {
      return res.status(403).send({ msg: "No tienes permisos para acceder a esta información" });
    }

    const jefe = await User.findById(userId);
    if (!jefe) {
      return res.status(404).send({ msg: "Usuario no encontrado" });
    }


    const { 
        name,
        lastname, 
        password, 
        email, 
        num_doc, 
        type_doc, 
        telephone, 
        position, 
    } = req.body;

    
    console.log(req.body);
    if (!name || !lastname || !password || !email || !num_doc) {
        return res.status(400).send({ msg: "Todos los campos obligatorios deben ser completados" });
    }

    if (!password) {
        return res.status(400).send({ msg: "La contraseña es requerida" });
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

    const id_department = jefe.id_department;
    const id_boss = jefe._id;
    const user = new User({
        name,
        lastname,
        email: email.toLowerCase(),
        password: hashPassword,
        num_doc,
        type_doc,
        telephone,
        position,
        id_department,
        id_boss,
    });

    try {
        const userStorage = await user.save();
        res.status(201).send(userStorage);
    } catch (error) {
        res.status(400).send({ msg: "Error al crear el usuario", error });
    }
};


const getMe= async(req,res)=>{
    try{
        const userId= req.user._id;
        const response = await User.findById(userId);
        if(!response){
            return res.status(400).send({msg: "No se ha encontrado usuario"});
        }
        res.status(200).send(response);
    }
    catch(error){
        res.status(500).send({msg:"Error desconcido. Intenta mas tarde"});
    }
};

const changePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).send({ msg: "No se ha encontrado el usuario" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).send({ msg: 'Contraseña actual incorrecta' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.status(200).send({ msg: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        res.status(500).send({ msg: "Error desconocido. Intenta más tarde" });
    }
};

const getUser= async(req, res)=>{
    try{
        const{ id }= req.params;
        const response= await User.findById(id);
        if(!response){
            return res.status(400).send({msg: "No se encontro usuario"});
        }
        res.status(200).send(response);
    }
    catch (error){
        res.status(500).send({msg: "Error del servidor"})
    }
};

const getUsers= async(req, res)=>{
    try{
        const {active}= req.query;
        let response= null;

        if(active==undefined){
            response= await User.find();
        }else{
            response=await User.find({active});
        }
        res.status(200).send(response)
    }catch(error){
        res.status(500).send({msg:"Error del servidor"})
    }
};

const updateUser = async (req, res) => {
    try {
        const { rol, _id: adminId } = req.user;
        
        if (rol !== "jefe") {
            return res.status(403).send({ 
                msg: "No tienes permisos para actualizar usuarios. Se requiere rol de administrador" 
            });
        }
 
        const admin = await User.findById(adminId);
        if (!admin) {
            return res.status(404).send({ msg: "Usuario administrador no encontrado" });
        }
 
        const { id } = req.params;
        const userData = req.body;
 
        const allowedFields = ['email', 'telephone', 'position', 'id_department', 'active','name','lastname'];
        const updateData = {};
 
        for (const field of allowedFields) {
            if (userData[field] !== undefined) {
                updateData[field] = userData[field];
            }
        }
 
        if (updateData.id_department) {
            const department = await Department.findById(updateData.id_department);
            if (!department) {
                return res.status(404).send({ msg: "El departamento no existe" });
            }
        }
 
        const updatedUser = await User.findByIdAndUpdate(
            { _id: id }, 
            updateData, 
            { new: true }
        );
 
        if (!updatedUser) {
            return res.status(404).send({ msg: "Usuario no encontrado" });
        }
 
        res.status(200).send({ 
            msg: "Actualización correcta", 
            user: updatedUser 
        });
 
    } catch (error) {
        res.status(400).send({ 
            msg: "Error de actualización", 
            error: error.message 
        });
    }
 };
 
const deleteUser= async( req, res)=>{
    try{
        const {id}= req.params;
        await User.findByIdAndDelete(id);
        res.status(200).send({msg: "Usuario Eliminado"});
    }catch(error){
        res.status(400).send({msg: "Error al eliminar usuario"})
    }
}

module.exports = {
    getMe: [upload.none(), getMe],
    changePassword: [upload.none(), changePassword],
    getUser,
    getUsers,
    createUser: [upload.none(), createUser],
    updateUser: [upload.none(), updateUser],
};
