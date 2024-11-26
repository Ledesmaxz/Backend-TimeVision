const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shift = new Schema({
  name_shift: { type: String, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true }
});

module.exports = mongoose.model('Shift', shift);
