import { configureStore } from "@reduxjs/toolkit";
import orderSlice from "./features/ordersSlice";

export const store = configureStore({
  reducer: {
    employeeKey: orderSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
