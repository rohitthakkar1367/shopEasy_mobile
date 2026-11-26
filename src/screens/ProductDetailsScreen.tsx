import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getProduct } from '../services/api';
import type { RootStackParamList } from '../navigation/types';
import type { Product } from '../types/product';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { addToCart } from '../redux/cartSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetails'>;

export default function ProductDetailsScreen({ route, navigation }: Props) {
  const { productId } = route.params;
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector(state => state.auth.isLoggedIn);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');
    getProduct(productId)
      .then(data => {
        if (!ignore) setProduct(data);
      })
      .catch(() => {
        if (!ignore) setError('Could not load this product.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [productId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#2874f0" style={styles.center} />;
  }

  if (error || !product) {
    return <Text style={styles.msg}>{error || 'Product not found'}</Text>;
  }

  return (
    <ScrollView style={styles.screen}>
      <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />
      <View style={styles.body}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        <Text style={styles.desc}>{product.description}</Text>
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          onPress={() => {
            if (!isLoggedIn) {
              navigation.navigate('Login', {
                returnTo: 'ProductDetails',
                pendingProduct: product,
              });
              return;
            }
            dispatch(addToCart(product));
            ToastAndroid.show('Added to cart', ToastAndroid.SHORT);
          }}
        >
          <Text style={styles.btnText}>Add to Cart</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center' },
  msg: { padding: 16, color: '#c62828' },
  image: { width: '100%', height: 260, backgroundColor: '#f1f3f6' },
  body: { padding: 16 },
  name: { fontSize: 22, fontWeight: '700' },
  category: { color: '#666', marginTop: 4 },
  price: { fontSize: 24, fontWeight: 'bold', color: '#2874f0', marginVertical: 12 },
  desc: { color: '#444', lineHeight: 20, marginBottom: 16 },
  btn: { backgroundColor: '#fb641b', padding: 14, borderRadius: 6, alignItems: 'center' },
  btnPressed: { opacity: 0.7 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});