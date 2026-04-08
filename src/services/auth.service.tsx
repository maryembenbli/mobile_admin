/*import api from './api';

export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};*/
/*import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export const login = async (email, password) => {
  console.log('✅ handleLogin clicked');

  const res = await api.post('/auth/login', { email, password });

  await AsyncStorage.setItem('token', res.data.access_token);
  await AsyncStorage.setItem('user', JSON.stringify(res.data.user));

  return res.data;
};

export const logout = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
};

export const getStoredUser = async () => {
  const u = await AsyncStorage.getItem('user');
  return u ? JSON.parse(u) : null;
};
export const saveAuth = async (token: string, user: any) => {
  await AsyncStorage.setItem("token", token);
  await AsyncStorage.setItem("user", JSON.stringify(user));
};


export const getToken = async () => {
  return AsyncStorage.getItem('token');
};
export const forgotPassword = async (email) => {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data; // { ok:true, resetToken? }
};

export const resetPassword = async (token, newPassword) => {
  const res = await api.post('/auth/reset-password', { token, newPassword });
  return res.data; // { ok:true }
};
*/
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import type { UserPermission } from "../constants/permissions";

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const LOGOUT_REASON_KEY = 'auth_logout_reason';

type AuthUser = {
  sub: string;
  email?: string;
  isSuperAdmin?: boolean;
  permissions?: UserPermission[];
};

type LoginResponse = {
  access_token: string;
  user: AuthUser;
};

type SetupAdminPasswordResponse = {
  ok: boolean;
  email: string;
};

export const saveAuth = async (token: string, user: AuthUser) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  await AsyncStorage.removeItem(LOGOUT_REASON_KEY);
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>('/auth/login', {
    email: email.trim().toLowerCase(),
    password,
  });

  await saveAuth(res.data.access_token, res.data.user);
  return res.data;
};

export const logout = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
};

export const expireSession = async (reason = 'SESSION_EXPIRED') => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
  await AsyncStorage.setItem(LOGOUT_REASON_KEY, reason);
};

export const consumeLogoutReason = async (): Promise<string | null> => {
  const reason = await AsyncStorage.getItem(LOGOUT_REASON_KEY);
  if (reason) {
    await AsyncStorage.removeItem(LOGOUT_REASON_KEY);
  }
  return reason;
};

export const getStoredUser = async (): Promise<AuthUser | null> => {
  const u = await AsyncStorage.getItem(USER_KEY);
  if (!u) return null;

  try {
    return JSON.parse(u) as AuthUser;
  } catch {
    await AsyncStorage.removeItem(USER_KEY);
    return null;
  }
};

export const getToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(TOKEN_KEY);
};


export const forgotPassword = async (email: string) => {
  const res = await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
  return res.data;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const res = await api.post('/auth/reset-password', { token, newPassword });
  return res.data;
};

export const setupAdminPassword = async (
  token: string,
  newPassword: string,
): Promise<SetupAdminPasswordResponse> => {
  const res = await api.post<SetupAdminPasswordResponse>(
    '/auth/setup-admin-password',
    {
      token: token.trim(),
      newPassword,
    },
  );

  return res.data;
};

