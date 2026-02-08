import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { getToken } from '../src/services/auth.service';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) router.replace('/dashboard');
      else router.replace('/login');
    })();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}
