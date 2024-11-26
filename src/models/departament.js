const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const departament = new Schema({
  name: { type: String, required: true },
  id_company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
});

module.exports = mongoose.model('Departament', departament);
