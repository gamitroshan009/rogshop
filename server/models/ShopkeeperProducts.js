const mongoose = require('mongoose');

const ShopkeeperProductsSchema = new mongoose.Schema({
  shopkeeperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shopkeeper', required: true }, // Reference to Shopkeeper
  shopName: { type: String, required: true },
  productImage: { type: String, required: true }, // Store Base64 string
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  category: { type: String, required: true }, // Add category field
}, { timestamps: true });

module.exports = mongoose.model('ShopkeeperProducts', ShopkeeperProductsSchema);