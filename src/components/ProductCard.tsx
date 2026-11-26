import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  name: string;
  price: number;
  image: string;
  onAdd: () => void;
  onPress?: () => void;
};

export default function ProductCard({ name, price, image, onAdd, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.body}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.price}>${price.toFixed(2)}</Text>
        <Pressable
          onPress={onAdd}
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        >
          <Text style={styles.btnText}>Add to Cart</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: 260, backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden', elevation: 3 },
  image: { width: '100%', height: 160 },
  body: { padding: 12 },
  name: { fontSize: 16, fontWeight: '600' },
  price: { fontSize: 18, fontWeight: 'bold', color: '#2874f0', marginVertical: 6 },
  btn: { backgroundColor: '#fb641b', padding: 10, borderRadius: 6, alignItems: 'center' },
  btnPressed: { opacity: 0.7 },
  btnText: { color: '#fff', fontWeight: '600' },
});