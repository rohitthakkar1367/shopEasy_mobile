import axios from 'axios';
import type { Product } from '../types/product';
import type { AuthUser } from '../redux/authSlice';

const api = axios.create({ baseURL: 'https://dummyjson.com', timeout: 10000 });

type ApiProduct = {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  category: string;
};

const toProduct = (p: ApiProduct): Product => ({
  id: String(p.id),
  name: p.title,
  price: p.price,
  image: p.thumbnail,
  category: p.category,
  description: p.description,
});

export async function getProducts(): Promise<Product[]> {
  const res = await api.get<{ products: ApiProduct[] }>('/products', { params: { limit: 20 } });
  return res.data.products.map(toProduct);
}

export async function getProduct(id: string): Promise<Product> {
  const res = await api.get<ApiProduct>(`/products/${id}`);
  return toProduct(res.data);
}

type ApiLoginResponse = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  accessToken: string;
};

export async function loginUser(
  username: string,
  password: string,
): Promise<{ user: AuthUser; token: string }> {
  const res = await api.post<ApiLoginResponse>('/auth/login', {
    username: username.trim(),
    password,
  });
  const d = res.data;
  return {
    token: d.accessToken,
    user: {
      id: String(d.id),
      username: d.username,
      email: d.email,
      firstName: d.firstName,
      lastName: d.lastName,
    },
  };
}