import { v4 as uuidv4 } from "uuid";
import { Order } from "../models/orders";

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface OrderDetails {
  name: string;
  price: number;
}

interface OrderItem2 {
  id: string;
  details: OrderDetails;
  quantity: number;
  _id: string;
}

interface Order {
  id: string;
  items: OrderItem2[];
  createdAt: string;
  status: string;
  _id: string;
  __v: number;
}

export interface OrderResponse {
  message: string;
  order: Order;
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

export const getAllOrders = async (): Promise<OrderResponse[]> => {
  return await Order.find();
};
