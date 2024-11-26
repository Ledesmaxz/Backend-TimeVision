const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const request = new Schema({
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  attach: { type: String},
  state: {type: String, default:"pendiente"},
  id_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  update: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', request);
