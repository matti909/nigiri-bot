import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  details: {
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  quantity: { type: Number, required: true },
});

const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true },
  items: [OrderItemSchema],
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: "pending" },
});

export const Order = mongoose.model("Order", OrderSchema);
