import React from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import type { RootStackParamList } from '../navigation/types';
import {
  clearCart,
  decreaseQty,
  increaseQty,
  removeFromCart,
  selectCartTotal,
} from '../redux/cartSlice';
import { addOrder } from '../redux/ordersSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export default function CartScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const items = useAppSelector(state => state.cart.items);
  const total = useAppSelector(selectCartTotal);
  const isLoggedIn = useAppSelector(state => state.auth.isLoggedIn);

  const handleCheckout = () => {
    if (items.length === 0) return;
    dispatch(
      addOrder({
        id: String(Date.now()),
        createdAt: new Date().toISOString(),
        items: items.map(i => ({ ...i })),
        total,
      }),
    );
    dispatch(clearCart());
    ToastAndroid.show('Order placed!', ToastAndroid.SHORT);
    navigation.replace('Orders');
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.guard}>
        <Text style={styles.empty}>Please login to view your cart</Text>
        <Pressable
          style={styles.loginBtn}
          onPress={() => navigation.replace('Login', { returnTo: 'Cart' })}
        >
          <Text style={styles.clearText}>Go to Login</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Your cart is empty</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image source={{ uri: item.image }} style={styles.img} />
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              <View style={styles.qtyRow}>
                <Pressable style={styles.qtyBtn} onPress={() => dispatch(decreaseQty(item.id))}>
                  <Text style={styles.qtyText}>-</Text>
                </Pressable>
                <Text style={styles.qty}>{item.quantity}</Text>
                <Pressable style={styles.qtyBtn} onPress={() => dispatch(increaseQty(item.id))}>
                  <Text style={styles.qtyText}>+</Text>
                </Pressable>
                <Pressable onPress={() => dispatch(removeFromCart(item.id))}>
                  <Text style={styles.remove}>Remove</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />

      {items.length > 0 && (
        <View style={styles.footer}>
          <View>
            <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
            <Pressable onPress={() => dispatch(clearCart())}>
              <Text style={styles.clearLink}>Clear Cart</Text>
            </Pressable>
          </View>
          <Pressable style={styles.checkoutBtn} onPress={handleCheckout}>
            <Text style={styles.clearText}>Checkout</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f1f3f6' },
  list: { padding: 16 },
  empty: { textAlign: 'center', marginTop: 40, color: '#666' },
  row: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 12 },
  img: { width: 80, height: 80, borderRadius: 6, backgroundColor: '#f1f3f6' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '600' },
  price: { color: '#2874f0', fontWeight: 'bold', marginVertical: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#e8eefc', alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 18, color: '#2874f0', fontWeight: 'bold' },
  qty: { marginHorizontal: 12, fontSize: 16 },
  remove: { marginLeft: 16, color: '#c62828' },
  footer: { backgroundColor: '#fff', padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  total: { fontSize: 18, fontWeight: 'bold' },
  clearLink: { color: '#c62828', marginTop: 4, fontSize: 13 },
  checkoutBtn: { backgroundColor: '#fb641b', paddingHorizontal: 18, paddingVertical: 11, borderRadius: 6 },
  clearText: { color: '#fff', fontWeight: '600' },
  guard: { flex: 1, backgroundColor: '#f1f3f6', justifyContent: 'center', alignItems: 'center', padding: 16 },
  loginBtn: { backgroundColor: '#2874f0', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6, marginTop: 12 },
});