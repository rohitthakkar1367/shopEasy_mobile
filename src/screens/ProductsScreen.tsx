import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../services/api';
import type { RootStackParamList } from '../navigation/types';
import type { Product } from '../types/product';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { addToCart, selectCartCount } from '../redux/cartSlice';
import { logout } from '../redux/authSlice';
import { clearAuth } from '../services/authStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'Products'>;

export default function ProductsScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartCount);
  const { isLoggedIn, user } = useAppSelector(state => state.auth);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');
    getProducts()
      .then(data => {
        if (!ignore) setProducts(data);
      })
      .catch(() => {
        if (!ignore) setError('Could not load products. Check your internet.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter(
    p =>
      p.name.toLowerCase().includes(search.trim().toLowerCase()) &&
      (category === 'All' || p.category === category),
  );

  const handleOpenCart = () => {
    if (!isLoggedIn) {
      navigation.navigate('Login', { returnTo: 'Cart' });
      return;
    }
    navigation.navigate('Cart');
  };

  const handleLogout = () => {
    clearAuth();
    dispatch(logout());
    ToastAndroid.show('Logged out', ToastAndroid.SHORT);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={styles.brand}>ShopEasy</Text>
          {isLoggedIn ? (
            <View style={styles.authRow}>
              <Pressable style={styles.authBtn} onPress={() => navigation.navigate('Orders')}>
                <Text style={styles.cartText}>Orders</Text>
              </Pressable>
              <Pressable style={styles.authBtn} onPress={() => navigation.navigate('Profile')}>
                <Text style={styles.cartText}>{user?.firstName || 'Profile'}</Text>
              </Pressable>
              <Pressable style={styles.authBtn} onPress={handleLogout}>
                <Text style={styles.cartText}>Logout</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.authBtn} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.cartText}>Login</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.topRow}>
          <TextInput
            style={styles.input}
            value={search}
            onChangeText={setSearch}
            placeholder="Search products"
            placeholderTextColor="#888"
          />
          <Pressable style={styles.cartBtn} onPress={handleOpenCart}>
            <Text style={styles.cartText}>Cart ({cartCount})</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          {categories.map(c => (
            <Pressable
              key={c}
              onPress={() => setCategory(c)}
              style={[styles.chip, category === c && styles.chipActive]}
            >
              <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2874f0" style={styles.center} />
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Pressable style={styles.retry} onPress={() => setReloadKey(k => k + 1)}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.content}
          renderItem={({ item }) => (
            <ProductCard
              name={item.name}
              price={item.price}
              image={item.image}
              onAdd={() => {
                if (!isLoggedIn) {
                  navigation.navigate('Login', { returnTo: 'Products', pendingProduct: item });
                  return;
                }
                dispatch(addToCart(item));
                ToastAndroid.show('Added to cart', ToastAndroid.SHORT);
              }}
              onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.gap} />}
          ListEmptyComponent={<Text>No products found</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f1f3f6' },
  header: { backgroundColor: '#2874f0', paddingTop: 48, paddingBottom: 12, paddingHorizontal: 16 },
  brandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  brand: { color: '#fff', fontSize: 18, fontWeight: '700' },
  authRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  authBtn: { backgroundColor: '#ffffff33', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 6, paddingHorizontal: 12, height: 42, color: '#000' },
  cartBtn: { marginLeft: 10, backgroundColor: '#ffffff33', paddingHorizontal: 12, height: 42, borderRadius: 6, justifyContent: 'center' },
  cartText: { color: '#fff', fontWeight: '600' },
  chips: { marginTop: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#ffffff33', marginRight: 8 },
  chipActive: { backgroundColor: '#fff' },
  chipText: { color: '#fff' },
  chipTextActive: { color: '#2874f0', fontWeight: '600' },
  content: { alignItems: 'center', paddingVertical: 16 },
  gap: { height: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: '#c62828', marginBottom: 12 },
  retry: { backgroundColor: '#2874f0', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 },
  retryText: { color: '#fff', fontWeight: '600' },
});