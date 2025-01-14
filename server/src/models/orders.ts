import { Schema, model } from "mongoose";

const orderSchema = new Schema({
  items: {
    type: [String],
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("Order", orderSchema);
