import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import axios from 'axios';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { loginUser } from '../services/api';
import { saveAuth } from '../services/authStorage';
import { useAppDispatch } from '../redux/hooks';
import { setAuth } from '../redux/authSlice';
import { addToCart } from '../redux/cartSlice';
import type { InternalScreen, RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const ALLOWED_SCREENS: InternalScreen[] = ['Products', 'ProductDetails', 'Cart', 'Orders', 'Profile'];

export default function LoginScreen({ navigation, route }: Props) {
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const pendingDoneRef = useRef(false);

  const handleLogin = async () => {
    if (loading) return;
    if (!username.trim()) {
      setError('Please enter your username.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const auth = await loginUser(username, password);
      await saveAuth(auth.user, auth.token);
      dispatch(setAuth(auth));

      const pending = route.params?.pendingProduct;
      if (pending && !pendingDoneRef.current) {
        pendingDoneRef.current = true;
        dispatch(addToCart(pending));
        ToastAndroid.show('Added to cart', ToastAndroid.SHORT);
      }

      const rawTarget = route.params?.returnTo;
      const target: InternalScreen =
        rawTarget && ALLOWED_SCREENS.includes(rawTarget) ? rawTarget : 'Products';

      if (target === 'Cart' || target === 'Orders' || target === 'Profile') {
        navigation.replace(target);
      } else if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.replace('Products');
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        setError('Invalid username or password.');
      } else {
        setError('Login failed. Check your internet and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Login to ShopEasy</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Username (e.g. emilys)"
          placeholderTextColor="#888"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
        />
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Pressable
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Login</Text>}
        </Pressable>
        <Text style={styles.hint}>Demo account: emilys / emilyspass</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f1f3f6', justifyContent: 'center', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#2874f0', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, paddingHorizontal: 12, height: 44, marginBottom: 12, color: '#000' },
  error: { color: '#c62828', marginBottom: 10 },
  btn: { backgroundColor: '#fb641b', padding: 14, borderRadius: 6, alignItems: 'center' },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  hint: { marginTop: 12, textAlign: 'center', color: '#666', fontSize: 12 },
});
