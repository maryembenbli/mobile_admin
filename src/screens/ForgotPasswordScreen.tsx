import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { forgotPassword } from '../services/auth.service';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSend = async () => {
    if (!email.trim()) return Alert.alert('Erreur', 'Email obligatoire');

    setLoading(true);
    try {
      const res = await forgotPassword(email.trim().toLowerCase());

      // DEV: backend يرجّع resetToken
      if (res?.resetToken) {
        setToken(res.resetToken);
        Alert.alert('✅ Token reçu (DEV)', res.resetToken);
      } else {
        Alert.alert('✅ OK', "Si l'email existe, un lien/code a été envoyé.");
      }

      // تنجم تمشي مباشرة للـ reset screen
      router.push('/reset-password');
    } catch (e: any) {
      console.log('FORGOT ERROR:', e?.response?.status, e?.response?.data);
      Alert.alert('Erreur', 'Impossible de lancer le reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 12 as any }}>
      <Text style={{ fontSize: 24, fontWeight: '800', textAlign: 'center' }}>
        Mot de passe oublié
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
      />

      <Pressable
        onPress={onSend}
        style={{ borderWidth: 1, borderRadius: 12, padding: 12, opacity: loading ? 0.6 : 1 }}
        disabled={loading}
      >
        <Text style={{ textAlign: 'center', fontWeight: '800' }}>
          {loading ? 'Envoi...' : 'Envoyer'}
        </Text>
      </Pressable>

      {/* DEV فقط: نعرض token إذا رجع */}
      {token ? (
        <Text style={{ marginTop: 10, textAlign: 'center' }}>
          DEV resetToken: {token}
        </Text>
      ) : null}

      <Pressable onPress={() => router.replace('/login')}>
        <Text style={{ textAlign: 'center', marginTop: 10 }}>Retour Login</Text>
      </Pressable>
    </View>
  );
}
