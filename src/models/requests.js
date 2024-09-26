const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const requests = new Schema({
  
  start_date: { type: String, required: true },
  end_date: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  adjunto: { type: String},
  state: {type: String, required: true},
  id_user: { type: Number, require:true},
  
});

module.exports = mongoose.model('Solicitudes', requests);