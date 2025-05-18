const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  category: { type: String, required: true },
});

const ShopkeeperProductsSchema = new mongoose.Schema({
  shopkeeperId: { type: String, required: true },
  shopName: { type: String, required: true },
  products: [ProductSchema],
});

module.exports = mongoose.model('ShopkeeperProducts', ShopkeeperProductsSchema);