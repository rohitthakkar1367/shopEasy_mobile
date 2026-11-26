import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  PermissionsAndroid,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import type { ImagePickerResponse } from 'react-native-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppSelector } from '../redux/hooks';
import { loadProfilePhoto, saveProfilePhoto } from '../services/storage';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const { user, isLoggedIn } = useAppSelector(state => state.auth);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [permMsg, setPermMsg] = useState('');
  const [needsSettings, setNeedsSettings] = useState(false);

  useEffect(() => {
    loadProfilePhoto().then(uri => {
      if (uri) setPhotoUri(uri);
    });
  }, []);

  if (!isLoggedIn || !user) {
    return (
      <View style={styles.center}>
        <Text style={styles.msg}>Please login to view your profile</Text>
        <Pressable
          style={styles.primaryBtn}
          onPress={() => navigation.replace('Login', { returnTo: 'Profile' })}
        >
          <Text style={styles.btnText}>Go to Login</Text>
        </Pressable>
      </View>
    );
  }

  const handlePickerResult = (res: ImagePickerResponse) => {
    if (res.didCancel) return;
    if (res.errorCode) {
      setPermMsg(res.errorMessage || 'Could not pick photo.');
      return;
    }
    const uri = res.assets?.[0]?.uri;
    if (uri) {
      setPhotoUri(uri);
      saveProfilePhoto(uri);
      setPermMsg('');
      setNeedsSettings(false);
    }
  };

  const handleTakePhoto = async () => {
    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
      title: 'Camera Permission',
      message: 'ShopEasy needs camera access to take your profile photo.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    });

    if (result === PermissionsAndroid.RESULTS.GRANTED) {
      setPermMsg('');
      setNeedsSettings(false);
      handlePickerResult(await launchCamera({ mediaType: 'photo', quality: 0.8 }));
    } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      setPermMsg('Camera permission blocked ("Don\'t ask again"). Enable it in Settings.');
      setNeedsSettings(true);
      Alert.alert('Permission Required', 'Enable Camera permission in App Settings to take a photo.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]);
    } else {
      setPermMsg('Camera permission denied. Tap "Take photo" again to allow.');
      setNeedsSettings(false);
    }
  };

  const handleGallery = async () => {
    setPermMsg('');
    setNeedsSettings(false);
    handlePickerResult(await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, quality: 0.8 }));
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.avatar} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.initials}>{user.firstName.charAt(0) || user.username.charAt(0)}</Text>
          </View>
        )}
        <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.row}>
          <Pressable style={styles.primaryBtn} onPress={handleTakePhoto}>
            <Text style={styles.btnText}>Take photo</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={handleGallery}>
            <Text style={styles.secondaryText}>Choose from gallery</Text>
          </Pressable>
        </View>
        {!!permMsg && <Text style={styles.error}>{permMsg}</Text>}
        {needsSettings && (
          <Pressable style={styles.settingsBtn} onPress={() => Linking.openSettings()}>
            <Text style={styles.btnText}>Open App Settings</Text>
          </Pressable>
        )}
      </View>
      <Pressable style={styles.navBtn} onPress={() => navigation.navigate('Orders')}>
        <Text style={styles.secondaryText}>My Orders</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f1f3f6', padding: 16 },
  center: { flex: 1, backgroundColor: '#f1f3f6', justifyContent: 'center', alignItems: 'center', padding: 16 },
  msg: { color: '#666', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 20, alignItems: 'center', marginBottom: 14 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 12, backgroundColor: '#f1f3f6' },
  placeholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#2874f0', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  initials: { color: '#fff', fontSize: 36, fontWeight: '700' },
  name: { fontSize: 18, fontWeight: '700' },
  email: { color: '#666', marginTop: 2, marginBottom: 14 },
  row: { flexDirection: 'row', gap: 10 },
  primaryBtn: { backgroundColor: '#2874f0', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 6 },
  secondaryBtn: { borderWidth: 1, borderColor: '#2874f0', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 6 },
  secondaryText: { color: '#2874f0', fontWeight: '600' },
  btnText: { color: '#fff', fontWeight: '600' },
  error: { color: '#c62828', marginTop: 12, textAlign: 'center' },
  settingsBtn: { backgroundColor: '#fb641b', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6, marginTop: 8 },
  navBtn: { backgroundColor: '#fff', padding: 14, borderRadius: 10, alignItems: 'center' },
});
