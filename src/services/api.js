import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_IP = '172.20.10.2'; // <-- حط IP متاع PC (نفس اللي يبان في exp://...)

// ✅ baseURL حسب البيئة
const baseURL =
  Platform.OS === 'web'
    ? 'http://localhost:3000'      // browser على نفس PC
    : Platform.OS === 'android'
      ? 'http://10.0.2.2:3000'     // Android Emulator
      : `http://${LOCAL_IP}:3000`; // iOS device / physical phone

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

