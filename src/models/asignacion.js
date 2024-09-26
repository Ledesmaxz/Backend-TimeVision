const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const asignacion = new Schema({
  id_user: { type: Number, require: true },
  id_turno: { type: Number, require: true },
  time_start: { type: String, required: true },
  time_end: { type: String, required: true },
});

module.exports = mongoose.model("Asignacion", asignacion);
