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
  position: {type: String, required: true},
  id_department: { type: Number, require:true},
  id_boss: { type: Number, require:true},
  active: {type: Boolean, default: false},
  disabled: {type: Boolean, default: false}
});

module.exports = mongoose.model('UserCollection', user);
