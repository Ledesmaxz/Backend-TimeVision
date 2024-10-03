const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assignmentSchema = new Schema({
  id_user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  id_shift: { type: Schema.Types.ObjectId, ref: 'Shift', required: true },
  time_start: { type: Date, required: true },
  time_end: { type: Date, required: true },
});

module.exports = mongoose.model('Assignment', assignmentSchema);
