const User = require("../models/user");
const { uploadFile, deleteFile } = require("../utils/upload");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("../utils/jwt");
const multer = require("multer");
const upload = multer();

const createUser= async (req, res)=> {   
    try {
        const userData = req.body;
        const user= new User({...userData, active:false, disabled:false});

        const salt =await bcrypt.genSalt(10);
        const hashedPassword =await bcrypt.hash(userData.password,salt);

        user.password=hashedPassword;
        const userStored = await user.save();
        res.status(201).send(userStored);
    } catch (error) {
        res.status(400).send({ msg: "Error al crear el usuario", error: error.message });
    }
}

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
const updateUser = async( req, res)=>{
    try{
        const {id}= req.params;
        const userData= req.body;

        if(userData.password){
            const salt= bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(userData.password, salt);
            userData.password= hashedPassword;
        }else{
            delete userData.password;
        }

        await User.findByIdAndUpdate({_id:id}, userData);
        res.status(200).send({msg: "Actualizacion correcta"});
    }catch(error){
        res.status(400).send({msg: "Error de actualizacion",error: error.message})

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
    createUser,
    updateUser,
    updatePhoto,
    deleteUser,
};
