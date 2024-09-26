const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = new Schema({
  
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  type_doc: { type: String, required: true },
  num_doc: { type: String, required: true },
  telephone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  photo: { type:String},
  cargo: {type: String, required: true},
  id_departament: { type: Number, require:true},
  id_jefe: { type: Number, require:true},
  state: {type: String, required: true}
});

module.exports = mongoose.model('UserCollection', user);
