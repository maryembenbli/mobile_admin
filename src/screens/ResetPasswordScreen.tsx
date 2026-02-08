import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { resetPassword } from '../services/auth.service';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onReset = async () => {
    if (!token.trim() || !newPassword.trim()) {
      return Alert.alert('Erreur', 'Token + nouveau mot de passe obligatoires');
    }

    setLoading(true);
    try {
      await resetPassword(token.trim(), newPassword);
      Alert.alert('✅ Succès', 'Mot de passe modifié. يمكنك تعمل login توّا.');
      router.replace('/login');
    } catch (e: any) {
      console.log('RESET ERROR:', e?.response?.status, e?.response?.data);
      Alert.alert('Erreur', 'Token invalid/expiré أو serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 12 as any }}>
      <Text style={{ fontSize: 24, fontWeight: '800', textAlign: 'center' }}>
        Réinitialiser mot de passe
      </Text>

      <TextInput
        placeholder="Reset Token (DEV)"
        value={token}
        onChangeText={setToken}
        autoCapitalize="none"
        style={{ borderWidth: 1, borderRadius: 10, padding: 12 }}
      />

      <TextInput
        placeholder="Nouveau mot de passe"
        value={newPassword}
        onChangeText={setNewPassword}
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
