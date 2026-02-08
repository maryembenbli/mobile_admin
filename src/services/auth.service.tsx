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

type AuthUser = {
  sub: string;
  isSuperAdmin?: boolean;
  permissions?: string[];
};

type LoginResponse = {
  access_token: string;
  user: AuthUser;
};

export const saveAuth = async (token: string, user: AuthUser) => {
  await AsyncStorage.setItem('token', token);
  await AsyncStorage.setItem('user', JSON.stringify(user));
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>('/auth/login', {
    email: email.trim(),
    password,
  });

  await saveAuth(res.data.access_token, res.data.user);
  return res.data;
};

export const logout = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
};

export const getStoredUser = async (): Promise<AuthUser | null> => {
  const u = await AsyncStorage.getItem('user');
  return u ? (JSON.parse(u) as AuthUser) : null;
};

export const getToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem('token');
};

// هذوما ينخدمو كان عندك endpoints في backend فعلاً
export const forgotPassword = async (email: string) => {
  const res = await api.post('/auth/forgot-password', { email: email.trim() });
  return res.data;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const res = await api.post('/auth/reset-password', { token, newPassword });
  return res.data;
};

