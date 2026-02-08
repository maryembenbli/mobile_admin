import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { createAdmin, deleteAdmin, getAdmins } from '../src/services/admins.service';

type AdminUser = {
  _id: string;
  email: string;
  isSuperAdmin: boolean;
  permissions: string[];
  createdAt?: string;
};

const PERMS: string[] = ['PRODUCTS', 'ORDERS', 'STATS'];

export default function AdminsScreen() {
  const router = useRouter();

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [email, setEmail] = useState<string>('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const load = async () => {
    setLoading(true);
    try {
      const list = await getAdmins();
      setAdmins(list);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de charger les admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const togglePerm = (p: string) => {
    setSelectedPerms(prev => (prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]));
  };

  const onCreate = async () => {
    if (!email.trim()) return Alert.alert('Erreur', 'Email obligatoire');

    try {
      const res = await createAdmin(email.trim().toLowerCase(), selectedPerms);
      console.log(res)
      Alert.alert('✅ Admin créé', `Email: ${res.email}\nPassword: ${res.password}`);
      setEmail('');
      setSelectedPerms([]);
      await load();
    } catch (e: any) {
      Alert.alert('Erreur', 'Création admin impossible');
    }
  };

  const onDelete = async (id: string) => {
    try {
      await deleteAdmin(id);
      await load();
    } catch (e) {
      Alert.alert('Erreur', 'Suppression impossible');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Pressable onPress={() => router.back()} style={{ marginBottom: 10 }}>
        <Text>← Retour</Text>
      </Pressable>

      <Text style={{ fontSize: 22, fontWeight: '800' }}>Gestion des Admins</Text>

      {/* Add admin */}
      <View style={{ marginTop: 16, borderWidth: 1, borderRadius: 12, padding: 12 }}>
        <Text style={{ fontWeight: '800' }}>Ajouter Admin</Text>

        <TextInput
          placeholder="Email admin"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 10 }}
        />

        <Text style={{ marginTop: 10, fontWeight: '800' }}>Permissions</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 as any, marginTop: 8 }}>
          {PERMS.map(p => (
            <Pressable
              key={p}
              onPress={() => togglePerm(p)}
              style={{
                borderWidth: 1,
                borderRadius: 999,
                paddingVertical: 6,
                paddingHorizontal: 12,
                opacity: selectedPerms.includes(p) ? 1 : 0.5,
              }}
            >
              <Text>{p}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={onCreate}
          style={{ marginTop: 12, borderWidth: 1, borderRadius: 12, padding: 12 }}
        >
          <Text style={{ textAlign: 'center', fontWeight: '800' }}>Créer</Text>
        </Pressable>

        {loading ? <Text style={{ marginTop: 8 }}>Chargement...</Text> : null}
      </View>

      {/* List */}
      <View style={{ marginTop: 16 }}>
        {admins.map(a => (
          <View key={a._id} style={{ borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 }}>
            <Text style={{ fontWeight: '800' }}>{a.isSuperAdmin ? 'Super Admin' : 'Admin'}</Text>
            <Text>{a.email}</Text>
            <Text style={{ marginTop: 6, opacity: 0.8 }}>Perms: {(a.permissions || []).join(', ') || '-'}</Text>

            {!a.isSuperAdmin && (
              <Pressable
                onPress={() => onDelete(a._id)}
                style={{ marginTop: 10, borderWidth: 1, borderRadius: 10, padding: 10 }}
              >
                <Text style={{ textAlign: 'center' }}>Supprimer</Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
