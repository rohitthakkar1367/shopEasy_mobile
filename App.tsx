import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { store } from './src/redux/store';
import { useAppDispatch, useAppSelector } from './src/redux/hooks';
import { setCart } from './src/redux/cartSlice';
import { setAuth } from './src/redux/authSlice';
import { setOrders } from './src/redux/ordersSlice';
import { loadCart, loadOrders, saveCart, saveOrders } from './src/services/storage';
import { loadAuth } from './src/services/authStorage';
import ProductsScreen from './src/screens/ProductsScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';
import CartScreen from './src/screens/CartScreen';
import LoginScreen from './src/screens/LoginScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import type { RootStackParamList } from './src/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function StorageSync() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(state => state.cart.items);
  const cartLoaded = useAppSelector(state => state.cart.hydrated);
  const orders = useAppSelector(state => state.orders.items);
  const ordersLoaded = useAppSelector(state => state.orders.hydrated);

  useEffect(() => {
    loadCart().then(saved => dispatch(setCart(saved)));
    loadOrders().then(saved => dispatch(setOrders(saved)));
    loadAuth().then(saved => {
      if (saved) dispatch(setAuth(saved));
    });
  }, [dispatch]);

  useEffect(() => {
    if (cartLoaded) saveCart(cartItems);
  }, [cartItems, cartLoaded]);

  useEffect(() => {
    if (ordersLoaded) saveOrders(orders);
  }, [orders, ordersLoaded]);

  return null;
}

export default function App() {
  return (
    <Provider store={store}>
      <StorageSync />
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Products"
            component={ProductsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ProductDetails"
            component={ProductDetailsScreen}
            options={{ title: 'Product Details' }}
          />
          <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'My Cart' }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
          <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'My Orders' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
