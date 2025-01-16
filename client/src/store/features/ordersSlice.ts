import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { OrderItem } from "../../types";

export interface ItemDetails {
  name: string;
  price: number;
}

export interface OrderItem2 {
  details: ItemDetails;
  id: string;
  quantity: number;
  _id: string;
}

export interface Order {
  _id: string;
  id: string;
  items: OrderItem2[];
  createdAt: string;
  status: string;
  __v: number;
}

interface IOrder {
  loading: boolean;
  orderList: Order[];
  error2: string | undefined;
  response: string | null;
}

const orderState: IOrder = {
  loading: false,
  orderList: [],
  error2: "",
  response: "",
};

const uri = "http://localhost:4000/orders";

export const fetchOrders = createAsyncThunk("orders/getorders", async () => {
  try {
    const response = await axios.get(uri + "/getorders");
    return response.data;
  } catch (error) {
    console.error("Error al enviar la orden:", error);
    throw error;
  }
});

export const addOrder = createAsyncThunk(
  "order/addOrder",
  async (order: OrderItem[]) => {
    if (!order || order.length === 0) {
      throw new Error("El pedido está vacío");
    }

    const requestPayload = {
      items: order.map((item) => ({
        details: {
          name: item.name,
          price: item.price,
        },
        quantity: item.quantity,
      })),
    };

    try {
      const response = await axios.post(uri, requestPayload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error al enviar la orden:", error);
      throw error;
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: orderState,
  reducers: {
    clearResponse: (state) => {
      state.response = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orderList = action.payload as Order[];
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error2 = action.error.message;
      });

    builder
      .addCase(addOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(addOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orderList.push(action.payload.order);
        state.response = "added";
      })
      .addCase(addOrder.rejected, (state, action) => {
        state.loading = false;
        state.error2 = action.error.message;
      });
  },
});

export default orderSlice.reducer;
export const { clearResponse } = orderSlice.actions;
