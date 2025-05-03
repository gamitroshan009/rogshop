const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  // Reference to Shopkeeper
  shopName: { type: String, required: true },
  productImage: { type: String, required: true }, // Path to the uploaded image
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
