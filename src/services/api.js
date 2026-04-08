import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

function resolveExpoHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants.manifest?.debuggerHost ||
    '';

  return hostUri ? hostUri.split(':')[0] : null;
}

function resolveBaseUrl() {
  const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envBaseUrl) {
    return envBaseUrl;
  }

  if (Platform.OS === 'web') {
    return 'http://127.0.0.1:3000';
  }

  if (Platform.OS === 'android') {
    const expoHost = resolveExpoHost();

    // Android emulator needs the loopback alias, but Expo on LAN works better with the dev machine IP.
    if (expoHost && expoHost !== 'localhost' && expoHost !== '127.0.0.1') {
      return `http://${expoHost}:3000`;
    }

    return 'http://10.0.2.2:3000';
  }

  const expoHost = resolveExpoHost();
  if (expoHost) {
    return `http://${expoHost}:3000`;
  }

  return 'http://127.0.0.1:3000';
}

const api = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
});

let handlingUnauthorized = false;

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      if (!handlingUnauthorized) {
        handlingUnauthorized = true;
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        await AsyncStorage.setItem('auth_logout_reason', 'SESSION_EXPIRED');
        setTimeout(() => {
          handlingUnauthorized = false;
        }, 250);
      }
    }

    return Promise.reject(error);
  },
);

export const API_BASE_URL = api.defaults.baseURL;
export default api;
