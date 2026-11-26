import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../types/product';
import type { RootState } from './store';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartState = { items: CartItem[]; hydrated: boolean };

const initialState: CartState = { items: [], hydrated: false };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.hydrated = true;
    },
    addToCart: (state, action: PayloadAction<Product>) => {
      const p = action.payload;
      const existing = state.items.find(i => i.id === p.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ id: p.id, name: p.name, price: p.price, image: p.image, quantity: 1 });
      }
    },
    increaseQty: (state, action: PayloadAction<string>) => {
      const item = state.items.find(i => i.id === action.payload);
      if (item) item.quantity += 1;
    },
    decreaseQty: (state, action: PayloadAction<string>) => {
      const item = state.items.find(i => i.id === action.payload);
      if (!item) return;
      if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        state.items = state.items.filter(i => i.id !== action.payload);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(i => i.id !== action.payload);
    },
    clearCart: state => {
      state.items = [];
    },
  },
});

export const { setCart, addToCart, increaseQty, decreaseQty, removeFromCart, clearCart } =
  cartSlice.actions;

export const selectCartCount = (state: RootState) =>
  state.cart.items.reduce((n, i) => n + i.quantity, 0);

export const selectCartTotal = (state: RootState) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

export default cartSlice.reducer;