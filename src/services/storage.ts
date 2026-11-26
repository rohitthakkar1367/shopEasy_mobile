import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import type { CartItem } from '../redux/cartSlice';
import type { Order } from '../redux/ordersSlice';

export const storage = createAsyncStorage('shopeasy');

const CART_KEY = 'cart';
const ORDERS_KEY = 'orders';
const PHOTO_KEY = 'profile_photo';

export async function loadCart(): Promise<CartItem[]> {
  try {
    const raw = await storage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveCart(items: CartItem[]): Promise<void> {
  try {
    await storage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage write errors
  }
}

export async function loadOrders(): Promise<Order[]> {
  try {
    const raw = await storage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveOrders(orders: Order[]): Promise<void> {
  try {
    await storage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {
    // Ignore storage write errors
  }
}

export async function loadProfilePhoto(): Promise<string | null> {
  try {
    return await storage.getItem(PHOTO_KEY);
  } catch {
    return null;
  }
}

export async function saveProfilePhoto(uri: string): Promise<void> {
  try {
    await storage.setItem(PHOTO_KEY, uri);
  } catch {
    // Ignore storage write errors
  }
}
