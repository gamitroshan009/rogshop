const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  userEmail: { type: String, required: true }, // Use only userEmail instead of userId
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shopkeeper', required: true },
  shopName: { type: String, required: true },
  product: { type: String, required: true },
  quantity: { type: Number, required: true },
  totalBill: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);