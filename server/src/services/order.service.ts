import { v4 as uuidv4 } from "uuid";
import { Order } from "../models/orders";

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

export const createNewOrder = async (items: OrderItem[]) => {
  const order = {
    id: uuidv4(),
    items: items.map((item) => ({
      ...item,
      id: uuidv4(),
    })),
    createdAt: new Date(),
    status: "pending",
  };

  const savedOrder = await new Order(order).save();
  return savedOrder;
};
