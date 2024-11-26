const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const company = new Schema({
    name: { type: String, required: true },
});

module.exports = mongoose.model('Company', company);
