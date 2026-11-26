import * as Keychain from 'react-native-keychain';
import type { AuthUser } from '../redux/authSlice';

const AUTH_SERVICE = 'shopeasy_auth';

type StoredAuth = { user: AuthUser; token: string };

export async function saveAuth(user: AuthUser, token: string): Promise<void> {
  try {
    await Keychain.setGenericPassword(user.username, JSON.stringify({ user, token }), {
      service: AUTH_SERVICE,
    });
  } catch {
    // Keep login active in memory even if keychain write fails
  }
}

export async function loadAuth(): Promise<StoredAuth | null> {
  try {
    const creds = await Keychain.getGenericPassword({ service: AUTH_SERVICE });
    if (!creds) return null;
    const parsed = JSON.parse(creds.password) as Partial<StoredAuth>;
    if (!parsed?.token || !parsed?.user?.username) return null;
    return { user: parsed.user, token: parsed.token };
  } catch {
    return null;
  }
}

export async function clearAuth(): Promise<void> {
  try {
    await Keychain.resetGenericPassword({ service: AUTH_SERVICE });
  } catch {
    // Ignore keychain reset errors on logout
  }
}

