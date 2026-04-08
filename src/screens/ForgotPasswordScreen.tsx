import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { forgotPassword } from '../services/auth.service';
import { getApiErrorMessage } from '../utils/api-error';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [screenMessage, setScreenMessage] = useState('');

  const onSend = async () => {
    if (!email.trim()) {
      setScreenMessage('Email obligatoire');
      return;
    }

    setLoading(true);
    setScreenMessage('');
    try {
      const res = await forgotPassword(email.trim().toLowerCase());

      if (res?.resetToken) {
        setToken(res.resetToken);
        setScreenMessage('Token de reinitialisation genere en mode developpement.');
      } else {
        setToken(null);
        setScreenMessage("Si l'email existe, un lien ou un code de reinitialisation a ete envoye.");
      }

      router.push('/reset-password');
    } catch (e: any) {
      console.log('FORGOT ERROR:', e?.response?.status, e?.response?.data);
      setScreenMessage(getApiErrorMessage(e, 'Impossible de lancer la reinitialisation.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 12 as any }}>
      <Text style={{ fontSize: 24, fontWeight: '800', textAlign: 'center' }}>
        Mot de passe oublie
      </Text>

      {screenMessage ? (
        <View
          style={{
            borderWidth: 1,
            borderColor: '#FCA5A5',
            backgroundColor: '#FEF2F2',
            borderRadius: 12,
            padding: 12,
          }}
        >
          <Text style={{ color: '#991B1B', fontWeight: '700', lineHeight: 20 }}>{screenMessage}</Text>
        </View>
      ) : null}

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          if (screenMessage) setScreenMessage('');
        }}
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
