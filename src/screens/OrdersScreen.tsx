import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppSelector } from '../redux/hooks';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Orders'>;

export default function OrdersScreen({ navigation }: Props) {
  const orders = useAppSelector(state => state.orders.items);
  const isLoggedIn = useAppSelector(state => state.auth.isLoggedIn);
  const [expandedId, setExpandedId] = useState<string | null>(orders[0]?.id ?? null);

  if (!isLoggedIn) {
    return (
      <View style={styles.guard}>
        <Text style={styles.empty}>Please login to view your orders</Text>
        <Pressable
          style={styles.loginBtn}
          onPress={() => navigation.replace('Login', { returnTo: 'Orders' })}
        >
          <Text style={styles.btnText}>Go to Login</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={orders}
        keyExtractor={o => o.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No orders yet</Text>}
        renderItem={({ item }) => {
          const isOpen = expandedId === item.id;
          return (
            <Pressable
              style={styles.card}
              onPress={() => setExpandedId(isOpen ? null : item.id)}
            >
              <View style={styles.row}>
                <Text style={styles.orderId}>Order #{item.id.slice(-6)}</Text>
                <Text style={styles.total}>${item.total.toFixed(2)}</Text>
              </View>
              <Text style={styles.meta}>
                {new Date(item.createdAt).toLocaleString()} · {item.items.length} item(s)
              </Text>
              {isOpen && (
                <View style={styles.details}>
                  {item.items.map(prod => (
                    <View key={prod.id} style={styles.itemRow}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {prod.name}
                      </Text>
                      <Text style={styles.itemPrice}>
                        {prod.quantity} x ${prod.price.toFixed(2)} = $
                        {(prod.quantity * prod.price).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f1f3f6' },
  list: { padding: 16 },
  empty: { textAlign: 'center', marginTop: 40, color: '#666' },
  guard: { flex: 1, backgroundColor: '#f1f3f6', justifyContent: 'center', alignItems: 'center', padding: 16 },
  loginBtn: { backgroundColor: '#2874f0', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6, marginTop: 12 },
  btnText: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 16, fontWeight: '700' },
  total: { fontSize: 16, fontWeight: '700', color: '#2874f0' },
  meta: { color: '#666', fontSize: 12, marginTop: 4 },
  details: { borderTopWidth: 1, borderTopColor: '#eee', marginTop: 10, paddingTop: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3 },
  itemName: { flex: 1, marginRight: 8, color: '#333' },
  itemPrice: { color: '#444', fontWeight: '500' },
});

