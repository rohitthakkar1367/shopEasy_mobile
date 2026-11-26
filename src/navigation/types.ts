import type { Product } from '../types/product';

export type InternalScreen = 'Products' | 'ProductDetails' | 'Cart' | 'Orders' | 'Profile';

export type LoginParams = {
  returnTo?: InternalScreen;
  pendingProduct?: Product;
};

export type RootStackParamList = {
  Products: undefined;
  ProductDetails: { productId: string };
  Cart: undefined;
  Login: LoginParams | undefined;
  Orders: undefined;
  Profile: undefined;
};
