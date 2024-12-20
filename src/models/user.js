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
  id_department: { type: mongoose.Schema.Types.ObjectId, ref: 'Deparment'},
  id_boss: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  active: {type: Boolean, default: false},
  disabled: {type: Boolean, default: false},
  working: {type: Boolean, default: false},
  notification_token : { type:String},
  resetPasswordToken: String,
  resetPasswordExpiry: Date
});


module.exports = mongoose.model('UserCollection', user);
