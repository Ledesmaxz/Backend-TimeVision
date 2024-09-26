const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const turno = new Schema({
    
  time_start: { type: String, required: true },
  time_end: { type: String, required: true },
  name_turno: { type: String, required: true },
  start_date: { type: String, required: true },
  end_date: { type: String, required: true }
  
});

module.exports = mongoose.model('Turno', turno);