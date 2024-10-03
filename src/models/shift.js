const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shift = new Schema({
    
  time_start: { type: Date, required: true },
  time_end: { type: Date, required: true },
  name_shift: { type: String, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true }
  
});

module.exports = mongoose.model('Shift', shift);
