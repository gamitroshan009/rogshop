const mongoose = require('mongoose');

const ProductsCategoriesSchema = new mongoose.Schema({
  shopkeeperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shopkeeper', required: true }, // Reference to Shopkeeper
  shopName: { type: String, required: true },
  categories: [{ type: String }], // Array of categories
}, { timestamps: true });

module.exports = mongoose.model('ProductsCategories', ProductsCategoriesSchema);