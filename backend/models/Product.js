const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  SKU: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  category: { type: Object, ref: 'Category' },
  createAt: { type: Date, default: Date.now },
}, { versionKey: false });

module.exports = mongoose.model('Product', productSchema);