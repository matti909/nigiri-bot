export interface Message {
  type: "ai";
  content: string;
}

export interface Conversation {
  message: string | Message;
  isHuman: boolean;
}

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}
