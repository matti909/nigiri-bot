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

export interface Order {
  id: string;
  items: OrderItem2[];
  createdAt: string;
  status: string;
  _id: string;
  __v: number;
}

export interface OrderResponse {
  order: Order;
}
