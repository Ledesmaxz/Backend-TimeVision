const User = require("../models/user");
const bcrypt = require("bcrypt");
const multer = require("multer");
const upload = multer();

const createUser= async (req, res)=> {   
    try {
        const userData = req.body;
        const user= new User({...userData, active:false});

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
    getUser,
    getUsers,
    createUser,
    updateUser,
    deleteUser,
};
