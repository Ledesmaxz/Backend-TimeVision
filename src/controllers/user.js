const User = require("../models/user");
const Request = require("../models/request");
const bcrypt = require("bcrypt");
const path = require("path");
const jwt = require("../utils/jwt");
const { uploadFile, deleteFile } = require("../utils/upload");
const multer = require("multer");
const upload = multer();
const mongoose = require("mongoose");

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

const getUsersDepartment= async(req, res)=>{
    try {
        const { rol } = req.user;
    
        if (rol !== "jefe") {
          return res.status(403).send({ msg: "No tienes permisos para acceder a esta información" });
        }

        const userId = req.user._id;
        const jefe = await User.findById(userId);
        if (!jefe) {
          return res.status(404).send({ msg: "Usuario no encontrado" });
        }
    
        const departmentId = jefe.id_department;
        if (!departmentId) {
          return res.status(400).send({ msg: "El jefe no tiene un departamento asignado" });
        }
    
        const usersInDepartment = await User.find({ id_department: departmentId });
    
        if (!usersInDepartment.length) {
          return res.status(404).send({ msg: "No se encontraron usuarios en este departamento" });
        }
    
        res.status(200).send(usersInDepartment);
      } catch (error) {
        res.status(500).send({ msg: "Error del servidor", error: error.message });
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

 const getStatusUsers = async (req, res) => {
    try {
        const { rol, _id: adminId } = req.user;

        if (rol !== "jefe") {
            return res.status(403).send({ 
                msg: "No tienes permisos para consultar usuarios. Se requiere rol de jefe" 
            });
        }

        const admin = await User.findById(adminId);
        if (!admin) {
            return res.status(404).send({ msg: "Usuario administrador no encontrado" });
        }

        const departmentId = new mongoose.Types.ObjectId(admin.id_department);
        const usersInDepartment = await User.find({ id_department: departmentId });

        if (usersInDepartment.length === 0) {
            return res.status(200).send({ 
                msg: "No hay usuarios en el departamento", 
                percentageWorking: 0, 
                percentageNotWorking: 0, 
                percentageOnLeave: 0 
            });
        }

        const totalUsers = usersInDepartment.length;
        const workingUsers = usersInDepartment.filter(user => user.working === true).length;

        // Obtén las solicitudes de tipo licencia aprobadas
        const today = new Date();
        const approvedLeaves = await Request.find({ 
            type: "Licencia", 
            state: "Aceptada", 
            start_date: { $lte: today }, 
            end_date: { $gte: today },
            id_user: { $in: usersInDepartment.map(user => user._id) }
        });

        const usersOnLeave = approvedLeaves.map(request => request.id_user);
        const uniqueUsersOnLeave = new Set(usersOnLeave);
        const notWorkingUsers = totalUsers - workingUsers - uniqueUsersOnLeave.size;

        const percentageWorking = ((workingUsers / totalUsers) * 100);
        const percentageNotWorking = ((notWorkingUsers / totalUsers) * 100);
        const percentageOnLeave = ((uniqueUsersOnLeave.size / totalUsers) * 100);

        res.status(200).send({
            msg: "Estado de usuarios calculado exitosamente",
            totalUsers,
            workingUsers,
            notWorkingUsers,
            usersOnLeave: uniqueUsersOnLeave.size,
            percentageWorking,
            percentageNotWorking,
            percentageOnLeave
        });
    } catch (error) {
        console.error("Error en getStatusUsers:", error);
        res.status(500).send({ msg: "Error del servidor" });
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

const isValidGoogleCloudUrl = (url) => {
    const regex = /^https:\/\/storage\.googleapis\.com\/[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_.]+$/;
    return regex.test(url);
};


const updatePhoto = async (req, res) => {
    const file = req.file;
    const userId = req.user._id;
  
    if (!file) {
      return res.status(400).send({ msg: "La nueva foto es requerida." });
    }
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send({ msg: "Usuario no encontrado" });
      }

      if (user.photo && isValidGoogleCloudUrl(user.photo)) {
        const oldFileName = user.photo.split("/").pop();
        await deleteFile(process.env.GOOGLE_CLOUD_BUCKET_NAME, oldFileName);
      }
  
      const newFileName = `${user.num_doc}-profile-image-${Date.now()}${path.extname(file.originalname)}`;
      const imageUrl = await uploadFile(process.env.GOOGLE_CLOUD_BUCKET_NAME, file.buffer, newFileName, file.mimetype);
  

      user.photo = imageUrl;
      await user.save();
  
      res.status(200).send({ msg: "Foto actualizada correctamente", photo: imageUrl });
    } catch (error) {
      console.error("Error al actualizar la foto:", error);
      res.status(500).send({ msg: "Error al actualizar la foto", error });
    }
  };
  

module.exports = {
    getMe: [upload.none(), getMe],
    changePassword: [upload.none(), changePassword],
    getUser,
    getUsersDepartment,
    updatePhoto,
    deleteUser,
    getStatusUsers: [upload.none(), getStatusUsers],
    createUser: [upload.none(), createUser],
    updateUser: [upload.none(), updateUser],
};

