import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { resetPassword } from '../services/auth.service';
import { getApiErrorMessage } from '../utils/api-error';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [screenMessage, setScreenMessage] = useState('');

  const onReset = async () => {
    if (!token.trim() || !newPassword.trim()) {
      setScreenMessage('Token et nouveau mot de passe obligatoires.');
      return;
    }

    setLoading(true);
    setScreenMessage('');
    try {
      await resetPassword(token.trim(), newPassword);
      Alert.alert('Succes', 'Mot de passe modifie. Vous pouvez maintenant vous connecter.');
      router.replace('/login');
    } catch (e: any) {
      console.log('RESET ERROR:', e?.response?.status, e?.response?.data);
      setScreenMessage(getApiErrorMessage(e, 'Token invalide, expire ou serveur indisponible.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 12 as any }}>
      <Text style={{ fontSize: 24, fontWeight: '800', textAlign: 'center' }}>
        Reinitialiser mot de passe
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
        placeholder="Reset Token"
        value={token}
        onChangeText={(value) => {
          setToken(value);
          if (screenMessage) setScreenMessage('');
        }}
        autoCapitalize="none"
        style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
      />

      <TextInput
        placeholder="Nouveau mot de passe"
        value={newPassword}
        onChangeText={(value) => {
          setNewPassword(value);
          if (screenMessage) setScreenMessage('');
        }}
        secureTextEntry
        style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
      />

      <Pressable
        onPress={onReset}
        style={{ borderWidth: 1, borderRadius: 12, padding: 12, opacity: loading ? 0.6 : 1 }}
        disabled={loading}
      >
        <Text style={{ textAlign: 'center', fontWeight: '800' }}>
          {loading ? 'Reset...' : 'Valider'}
        </Text>
      </Pressable>

      <Pressable onPress={() => router.replace('/login')}>
        <Text style={{ textAlign: 'center', marginTop: 10 }}>Retour Login</Text>
      </Pressable>
    </View>
  );
}
