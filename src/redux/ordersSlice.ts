import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from './cartSlice';

export type Order = {
  id: string;
  createdAt: string;
  items: CartItem[];
  total: number;
};

type OrdersState = {
  items: Order[];
  hydrated: boolean;
};

const initialState: OrdersState = {
  items: [],
  hydrated: false,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.items = action.payload;
      state.hydrated = true;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.items.unshift(action.payload);
    },
  },
});

export const { setOrders, addOrder } = ordersSlice.actions;
export default ordersSlice.reducer;

