const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const assignment = new Schema({
  id_user: { type: Number, require: true },
  id_shift: { type: Number, require: true },
  time_start: { type: String, required: true },
  time_end: { type: String, required: true },
});

module.exports = mongoose.model("Assignment", assignment);
