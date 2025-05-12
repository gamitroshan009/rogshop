const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shopkeeper', required: true },
  shopName: { type: String, required: true },
  email: { type: String, required: true },
  mobileNo: { type: String, required: true },
  address: { type: String, required: true },
  received: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  products: [
    {
      productName: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      category: { type: String, required: true }, // Add category field
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);