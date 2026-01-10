const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true }
}, { versionKey: false });

module.exports = mongoose.model('Category', categorySchema);