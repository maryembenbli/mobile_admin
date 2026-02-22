/*import React, { useEffect, useState } from 'react';
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
}*/
/*import React, { useEffect, useState } from "react";
import { View, Text, Pressable, TextInput, Alert, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { createAdmin, deleteAdmin, getAdmins, AdminUser } from "../src/services/admins.service";
import { logout } from "../src/services/auth.service";

const PERMS: string[] = ["PRODUCTS", "ORDERS", "STATS"];

export default function AdminsScreen() {
  const router = useRouter();

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [email, setEmail] = useState<string>("");
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);

  const load = async () => {
    setLoadingList(true);
    try {
      const list = await getAdmins();
      setAdmins(list);
    } catch (e: any) {
      if (e?.response?.status === 401) {
        await logout();
        router.replace("/login");
        return;
      }
      Alert.alert("Erreur", "Impossible de charger les admins");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const togglePerm = (p: string) => {
    setSelectedPerms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const onCreate = async () => {
    const mail = email.trim().toLowerCase();
    if (!mail) return Alert.alert("Erreur", "Email obligatoire");
    if (!mail.includes("@")) return Alert.alert("Erreur", "Email invalide");
    if (selectedPerms.length === 0) return Alert.alert("Erreur", "Choisis au moins une permission");

    setCreating(true);
    try {
      const res = await createAdmin(mail, selectedPerms);
      Alert.alert("✅ Admin créé", `Email: ${res.email}\nPassword: ${res.password}`);
      setEmail("");
      setSelectedPerms([]);
      await load();
    } catch (e: any) {
      if (e?.response?.status === 401) {
        await logout();
        router.replace("/login");
        return;
      }
      Alert.alert("Erreur", e?.response?.data?.message || "Création admin impossible");
    } finally {
      setCreating(false);
    }
  };

  const onDelete = (id: string) => {
    Alert.alert("Confirmation", "Supprimer cet admin ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAdmin(id);
            await load();
          } catch (e: any) {
            if (e?.response?.status === 401) {
              await logout();
              router.replace("/login");
              return;
            }
            Alert.alert("Erreur", "Suppression impossible");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Pressable onPress={() => router.back()} style={{ marginBottom: 10 }}>
        <Text>← Retour</Text>
      </Pressable>

      <Text style={{ fontSize: 22, fontWeight: "800" }}>Gestion des Admins</Text>

     
      <View style={{ marginTop: 16, borderWidth: 1, borderRadius: 12, padding: 12 }}>
        <Text style={{ fontWeight: "800" }}>Ajouter Admin</Text>

        <TextInput
          placeholder="Email admin"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 10 }}
        />

        <Text style={{ marginTop: 10, fontWeight: "800" }}>Permissions</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 as any, marginTop: 8 }}>
          {PERMS.map((p) => {
            const active = selectedPerms.includes(p);
            return (
              <Pressable
                key={p}
                onPress={() => togglePerm(p)}
                style={{
                  borderWidth: 1,
                  borderRadius: 999,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  opacity: active ? 1 : 0.5,
                  backgroundColor: active ? "#111827" : "transparent",
                }}
              >
                <Text style={{ color: active ? "white" : "black", fontWeight: "800" }}>{p}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={onCreate}
          disabled={creating}
          style={{
            marginTop: 12,
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            opacity: creating ? 0.6 : 1,
          }}
        >
          <Text style={{ textAlign: "center", fontWeight: "800" }}>
            {creating ? "Création..." : "Créer"}
          </Text>
        </Pressable>
      </View>

 
      <View style={{ marginTop: 16 }}>
        {loadingList ? (
          <View style={{ padding: 20 }}>
            <ActivityIndicator />
            <Text style={{ textAlign: "center", marginTop: 10 }}>Chargement...</Text>
          </View>
        ) : (
          admins.map((a) => (
            <View key={a._id} style={{ borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 }}>
              <Text style={{ fontWeight: "800" }}>{a.isSuperAdmin ? "Super Admin" : "Admin"}</Text>
              <Text>{a.email}</Text>
              <Text style={{ marginTop: 6, opacity: 0.8 }}>
                Perms: {a.isSuperAdmin ? "*" : (a.permissions || []).join(", ") || "-"}
              </Text>

              {!a.isSuperAdmin && (
                <Pressable
                  onPress={() => onDelete(a._id)}
                  style={{ marginTop: 10, borderWidth: 1, borderRadius: 10, padding: 10 }}
                >
                  <Text style={{ textAlign: "center" }}>Supprimer</Text>
                </Pressable>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
*/
//create + supprime + alert sans edit
/*import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Card, Input, Button } from "../src/ui/atoms";
import { colors } from "../src/ui/theme";
import { createAdmin, deleteAdmin, getAdmins } from "../src/services/admins.service";
import { logout } from "../src/services/auth.service";


export const showAlert = (title: string, msg?: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}${msg ? "\n" + msg : ""}`);
  } else {
    Alert.alert(title, msg);
  }
};


type AdminUser = {
  _id: string;
  email: string;
  isSuperAdmin: boolean;
  permissions: string[];
  createdAt?: string;
};

const PERMS: { key: string; label: string }[] = [
  { key: "PRODUCTS", label: "Gérer les produits" },
  { key: "ORDERS", label: "Gérer les commandes" },
  { key: "STATS", label: "Voir les statistiques" },
];

function Chip({ text }: { text: string }) {
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: "#EFF6FF",
        borderWidth: 1,
        borderColor: "#BFDBFE",
        marginRight: 8,
        marginTop: 8,
      }}
    >
      <Text style={{ color: colors.blue, fontWeight: "700", fontSize: 12 }}>{text}</Text>
    </View>
  );
}

function Tab({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: 3,
        borderBottomColor: active ? colors.orange : "transparent",
      }}
    >
      <Text style={{ fontWeight: "800", color: active ? colors.orange : colors.grayText }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function AdminsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [showCreate, setShowCreate] = useState(true);
  const [email, setEmail] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const title = useMemo(() => (isWide ? "Dashboard Super Admin" : "Admins"), [isWide]);

  const load = async () => {
    setLoadingList(true);
    try {
      const list = await getAdmins();
      setAdmins(list);
    } catch (e: any) {
      if (e?.response?.status === 401) {
        await logout();
        router.replace("/login");
        return;
      }
      Alert.alert("Erreur", "Impossible de charger les admins");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const togglePerm = (key: string) => {
    setSelectedPerms((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
  };

  const onCreate = async () => {
  const mail = email.trim().toLowerCase();
  if (!mail) return showAlert("Erreur", "Email obligatoire");
  if (!mail.includes("@")) return showAlert("Erreur", "Email invalide");
  if (selectedPerms.length === 0) return showAlert("Erreur", "Choisis au moins une permission");

    setCreating(true);
    try {
      const res = await createAdmin(mail, selectedPerms);

     
      Alert.alert("✅ Admin créé", `Email: ${res.email}\nPassword: ${res.password}`);

      setEmail("");
      setSelectedPerms([]);
      setShowCreate(false);
      await load();
    } catch (e: any) {
      if (e?.response?.status === 401) {
        await logout();
        router.replace("/login");
        return;
      }
      Alert.alert("Erreur", e?.response?.data?.message || "Création admin impossible");
    } finally {
      setCreating(false);
    }
  };

  const confirmDelete = (message: string) => {
  if (Platform.OS === "web") return window.confirm(message);
  // mobile
  return new Promise<boolean>((resolve) => {
    Alert.alert("Confirmation", message, [
      { text: "Annuler", style: "cancel", onPress: () => resolve(false) },
      { text: "Supprimer", style: "destructive", onPress: () => resolve(true) },
    ]);
  });
};

const onDelete = async (id: string) => {
  console.log("DELETE CLICK", id);

  const ok = await confirmDelete("Supprimer cet admin ?");
  if (!ok) return;

  try {
    await deleteAdmin(id);
    await load();
  } catch (e: any) {
    if (e?.response?.status === 401) {
      await logout();
      router.replace("/login");
      return;
    }
    if (Platform.OS === "web") window.alert("Suppression impossible");
    else Alert.alert("Erreur", "Suppression impossible");
  }
};

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
   
      <View style={{ backgroundColor: colors.blue, paddingTop: 14, paddingBottom: 14 }}>
        <View
          style={{
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Pressable onPress={() => router.back()} style={{ paddingVertical: 8, paddingRight: 10 }}>
            <Text style={{ color: "white", fontWeight: "800" }}>←</Text>
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text style={{ color: "white", fontWeight: "900", fontSize: 18 }}>{title}</Text>
            {isWide ? (
              <Text style={{ color: "#BFDBFE", marginTop: 2, fontWeight: "600", fontSize: 12 }}>
                Bienvenue, Super Administrateur
              </Text>
            ) : null}
          </View>

          <View style={{ width: 140 }}>
            <Button
              title="Déconnexion"
              variant="ghost"
              onPress={async () => {
                await logout();
                router.replace("/login");
              }}
            />
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row", backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Tab label="Vue Globale" active={false} onPress={() => router.push("/dashboard")} />
        <Tab label="Admins" active onPress={() => {}} />
        <Tab label="Statistiques" active={false} onPress={() => Alert.alert("TODO", "Statistiques screen بعدين")} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
       
        <View
          style={{
            flexDirection: isWide ? "row" : "column",
            justifyContent: "space-between",
            alignItems: isWide ? "center" : "flex-start",
            gap: 12 as any,
            marginBottom: 14,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "900", color: colors.blue }}>
            Gestion des Administrateurs
          </Text>

          <View style={{ width: isWide ? 220 : "100%" }}>
            <Button
              title={showCreate ? "Fermer" : "➕ Ajouter Admin"}
              variant="orange"
              onPress={() => setShowCreate((v) => !v)}
            />
          </View>
        </View>


        {showCreate && (
          <Card style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 16, fontWeight: "900", color: colors.blue }}>
              Nouvel Administrateur
            </Text>

            <Text style={{ marginTop: 12, marginBottom: 6, fontWeight: "800", color: colors.blue }}>
              Email
            </Text>
            <Input
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              placeholder="email@exemple.com"
            />

            <Text style={{ marginTop: 12, marginBottom: 8, fontWeight: "800", color: colors.blue }}>
              Permissions
            </Text>

            {PERMS.map((p) => {
              const active = selectedPerms.includes(p.key);
              return (
                <Pressable
                  key={p.key}
                  onPress={() => togglePerm(p.key)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 8,
                  }}
                >
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      borderWidth: 2,
                      borderColor: active ? colors.blue : "#9CA3AF",
                      backgroundColor: active ? colors.blue : "transparent",
                      marginRight: 10,
                    }}
                  />
                  <Text style={{ fontWeight: "700", color: "#111827" }}>{p.label}</Text>
                </Pressable>
              );
            })}

            <View style={{ flexDirection: isWide ? "row" : "column", gap: 10 as any, marginTop: 14 }}>
              <View style={{ flex: 1 }}>
                <Button
                  title={creating ? "Création..." : "Créer"}
                  onPress={onCreate}
                  disabled={creating}
                  variant="primary"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title="Annuler"
                  onPress={() => {
                    setShowCreate(false);
                    setEmail("");
                    setSelectedPerms([]);
                  }}
                  variant="ghost"
                />
              </View>
            </View>
          </Card>
        )}

       
        {loadingList ? (
          <View style={{ padding: 20 }}>
            <ActivityIndicator />
            <Text style={{ textAlign: "center", marginTop: 10 }}>Chargement...</Text>
          </View>
        ) : (
          admins.map((a) => (
            <Card key={a._id} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "900", color: colors.blue }}>
                    {a.isSuperAdmin ? "Admin Principal" : "Admin"}
                  </Text>
                  <Text style={{ color: colors.grayText, marginTop: 2 }}>{a.email}</Text>
                  {a.createdAt ? (
                    <Text style={{ color: "#9CA3AF", marginTop: 4, fontSize: 12 }}>
                      Créé le {new Date(a.createdAt).toLocaleDateString()}
                    </Text>
                  ) : null}

                  <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 6 }}>
                    {a.isSuperAdmin ? (
                      <Chip text="*" />
                    ) : (a.permissions || []).length ? (
                      a.permissions.map((p) => <Chip key={p} text={p} />)
                    ) : (
                      <Text style={{ marginTop: 8, color: "#9CA3AF" }}>Aucune permission</Text>
                    )}
                  </View>
                </View>

               {!a.isSuperAdmin && (
  <View style={{ marginTop: 12 }}>
    <Button title="Supprimer" variant="orange" onPress={() => onDelete(a._id)} />
  </View>
)}
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}*/
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   Pressable,
//   ActivityIndicator,
//   useWindowDimensions,
//   Alert,
//   Platform,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { Card, Input, Button } from "../src/ui/atoms";
// import { colors } from "../src/ui/theme";
// import {
//   getAdmins,
//   createAdmin,
//   deleteAdmin,
//   updateAdminPermissions,
//   AdminUser,
// } from "../src/services/admins.service";
// import { logout } from "../src/services/auth.service";
// import PermissionsTable from "../src/components/PermissionsTable";
// import { emptyPermissions } from "../src/constants/permissions";
// import type { PermissionsMap } from "../src/constants/permissions";

// const [createPerms, setCreatePerms] = useState<PermissionsMap>(emptyPermissions());
// const [draftPerms, setDraftPerms] = useState<Record<string, PermissionsMap>>({});

// const PERMS = [
//   { key: "PRODUCTS", label: "Produits" },
//   { key: "ORDERS", label: "Commandes" },
//   { key: "STATS", label: "Statistiques" },
// ] as const;

// /*const toast = (title: string, msg: string) => {
//   if (Platform.OS === "web") window.alert(`${title}\n\n${msg}`);
//   else require("react-native").Alert.alert(title, msg);
// };*/
// function toast(title: string, message?: string) {
//   if (Platform.OS === "web") {
//     // Web: ما فماش Alert native كيف mobile
//     window.alert(message ? `${title}\n\n${message}` : title);
//   } else {
//     Alert.alert(title, message ?? "");
//   }
// }

// function PermChip({
//   label,
//   active,
//   editable,
//   onPress,
// }: {
//   label: string;
//   active: boolean;
//   editable?: boolean;
//   onPress?: () => void;
// }) {
//   return (
//     <Pressable
//       onPress={editable ? onPress : undefined}
//       style={{
//         paddingHorizontal: 10,
//         paddingVertical: 6,
//         borderRadius: 999,
//         marginRight: 8,
//         marginTop: 8,
//         backgroundColor: active ? "#EFF6FF" : "#F3F4F6",
//         borderWidth: 1,
//         borderColor: active ? "#BFDBFE" : "#E5E7EB",
//         opacity: editable ? 1 : 0.9,
//       }}
//     >
//       <Text style={{ color: active ? colors.blue : "#6B7280", fontWeight: "700", fontSize: 12 }}>
//         {label}
//       </Text>
//     </Pressable>
//   );
// }

// export default function AdminsScreen() {
//   const router = useRouter();
//   const { width } = useWindowDimensions();
//   const isWide = width >= 900;

//   const [admins, setAdmins] = useState<AdminUser[]>([]);
//   const [loading, setLoading] = useState(true);

//   // create block مثل الصورة زر Ajouter Admin
//   const [showCreate, setShowCreate] = useState(false);
//   const [email, setEmail] = useState("");
//   const [createPerms, setCreatePerms] = useState<string[]>([]);
//   const [creating, setCreating] = useState(false);

//   // edit permissions per admin
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [draftPerms, setDraftPerms] = useState<Record<string, string[]>>({});
//   const [savingId, setSavingId] = useState<string | null>(null);

//   const title = useMemo(() => "Dashboard Super Admin", []);

//   const load = async () => {
//     setLoading(true);
//     try {
//       const list = await getAdmins();
//       setAdmins(list);
//       // init drafts
//       const map: Record<string, string[]> = {};
//       list.forEach((a) => (map[a._id] = a.permissions || []));
//       setDraftPerms(map);
//     } catch (e: any) {
//       if (e?.response?.status === 401) {
//         await logout();
//         router.replace("/login");
//         return;
//       }
//       toast("Erreur", "Impossible de charger les admins");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   const toggleCreatePerm = (key: string) => {
//     setCreatePerms((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
//   };

//   const toggleDraftPerm = (adminId: string, key: string) => {
//     setDraftPerms((prev) => {
//       const curr = prev[adminId] || [];
//       const next = curr.includes(key) ? curr.filter((x) => x !== key) : [...curr, key];
//       return { ...prev, [adminId]: next };
//     });
//   };



//   /*const onCreate = async () => {
//     const mail = email.trim().toLowerCase();
//     if (!mail) return toast("Erreur", "Email obligatoire");
//     if (!mail.includes("@")) return toast("Erreur", "Email invalide");
//     if (createPerms.length === 0) return toast("Erreur", "Choisis au moins une permission");

//     setCreating(true);
//     try {
//       const res = await createAdmin(mail, createPerms);
//       toast("✅ Admin créé", `Email: ${res.email}\nPassword: ${res.password}`);
//       setEmail("");
//       setCreatePerms([]);
//       setShowCreate(false);
//       await load();
//     } catch (e: any) {
//       if (e?.response?.status === 401) {
//         await logout();
//         router.replace("/login");
//         return;
//       }
//       toast("Erreur", e?.response?.data?.message || "Création admin impossible");
//     } finally {
//       setCreating(false);
//     }
//   };
// */
// const onCreate = async () => {
//   const mail = email.trim().toLowerCase();
//   if (!mail) return toast("Erreur", "Email obligatoire");
//   if (!mail.includes("@")) return toast("Erreur", "Email invalide");
//   if (createPerms.length === 0) return toast("Erreur", "Choisis au moins une permission");

//   setCreating(true);
//   try {
//     const res = await createAdmin(mail, createPerms);
//     toast("✅ Admin créé", `Email: ${res.email}\nPassword: ${res.password}`);
//     setEmail("");
//     setCreatePerms([]);
//     setShowCreate(false);
//     await load();
//   } catch (e: any) {
//     if (e?.response?.status === 401) {
//       await logout();
//       router.replace("/login");
//       return;
//     }
//     toast("Erreur", e?.response?.data?.message || "Création admin impossible");
//   } finally {
//     setCreating(false);
//   }
// };
//   const startEdit = (id: string) => {
//     setEditingId(id);
   
//   };

//   const cancelEdit = () => {
   
//     const map: Record<string, string[]> = {};
//     admins.forEach((a) => (map[a._id] = a.permissions || []));
//     setDraftPerms(map);
//     setEditingId(null);
//   };

//   const saveEdit = async (id: string) => {
//     const perms = draftPerms[id] || [];
//     setSavingId(id);
//     try {
//       await updateAdminPermissions(id, perms);
//       toast("✅ OK", "Permissions mises à jour");
//       setEditingId(null);
//       await load();
//     } catch (e: any) {
//       if (e?.response?.status === 401) {
//         await logout();
//         router.replace("/login");
//         return;
//       }
//       toast("Erreur", e?.response?.data?.message || "Update permissions impossible");
//     } finally {
//       setSavingId(null);
//     }
//   };

//   const onDelete = async (id: string) => {
//     const ok = Platform.OS === "web" ? window.confirm("Supprimer cet admin ?") : true;
//     if (!ok) return;

//     try {
//       await deleteAdmin(id);
//       await load();
//     } catch (e: any) {
//       if (e?.response?.status === 401) {
//         await logout();
//         router.replace("/login");
//         return;
//       }
//       toast("Erreur", "Suppression impossible");
//     }
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: colors.bg }}>
      
//       <View style={{ backgroundColor: colors.blue, paddingTop: 14, paddingBottom: 14 }}>
//         <View style={{ paddingHorizontal: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
//           <View>
//             <Text style={{ color: "white", fontWeight: "900", fontSize: 18 }}>{title}</Text>
//             <Text style={{ color: "#BFDBFE", marginTop: 2, fontWeight: "600", fontSize: 12 }}>
//               Bienvenue, Super Administrateur
//             </Text>
//           </View>

//           <View style={{ width: 160 }}>
//             <Button
//               title="Déconnexion"
//               variant="ghost"
//               onPress={async () => {
//                 await logout();
//                 router.replace("/login");
//               }}
//             />
//           </View>
//         </View>
//       </View>

//       {/* Tabs (نخليهم static) */}
//       <View style={{ flexDirection: "row", backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border }}>
//         <Pressable style={{ flex: 1, alignItems: "center", paddingVertical: 14 }}>
//           <Text style={{ fontWeight: "800", color: colors.grayText }}>Vue Globale</Text>
//         </Pressable>
//         <Pressable style={{ flex: 1, alignItems: "center", paddingVertical: 14, borderBottomWidth: 3, borderBottomColor: colors.orange }}>
//           <Text style={{ fontWeight: "800", color: colors.orange }}>Admins</Text>
//         </Pressable>
//         <Pressable style={{ flex: 1, alignItems: "center", paddingVertical: 14 }}>
//           <Text style={{ fontWeight: "800", color: colors.grayText }}>Statistiques</Text>
//         </Pressable>
//       </View>

//       <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
//         {/* Title + button Ajouter Admin */}
//         <View
//           style={{
//             flexDirection: isWide ? "row" : "column",
//             justifyContent: "space-between",
//             alignItems: isWide ? "center" : "flex-start",
//             gap: 12 as any,
//             marginBottom: 14,
//           }}
//         >
//           <Text style={{ fontSize: 18, fontWeight: "900", color: colors.blue }}>
//             Gestion des Administrateurs
//           </Text>

//           <View style={{ width: isWide ? 220 : "100%" }}>
//             <Button
//               title={showCreate ? "Fermer" : "➕ Ajouter Admin"}
//               variant="orange"
//               onPress={() => setShowCreate((v) => !v)}
//             />
//           </View>
//         </View>

//         {/* Create Card */}
//         {showCreate && (
//           <Card style={{ marginBottom: 14 }}>
//             <Text style={{ fontSize: 16, fontWeight: "900", color: colors.blue }}>Nouvel Administrateur</Text>

//             <Text style={{ marginTop: 12, marginBottom: 6, fontWeight: "800", color: colors.blue }}>Email</Text>
//             <Input value={email} onChangeText={setEmail} autoCapitalize="none" placeholder="email@exemple.com" />

//             <Text style={{ marginTop: 12, marginBottom: 6, fontWeight: "800", color: colors.blue }}>Permissions</Text>
//             <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
//               {PERMS.map((p) => (
//                 <PermChip
//                   key={p.key}
//                   label={p.label}
//                   active={createPerms.includes(p.key)}
//                   editable
//                   onPress={() => toggleCreatePerm(p.key)}
//                 />
//               ))}
//             </View>

//             <View style={{ marginTop: 14 }}>
//               <Button title={creating ? "Création..." : "Créer"} onPress={onCreate} disabled={creating} />
//             </View>
//           </Card>
//         )}

//         {/* List */}
//         {loading ? (
//           <View style={{ padding: 20 }}>
//             <ActivityIndicator />
//             <Text style={{ textAlign: "center", marginTop: 10 }}>Chargement...</Text>
//           </View>
//         ) : (
//           admins.map((a) => {
//             const isEditing = editingId === a._id;
//             const permsShown = isEditing ? (draftPerms[a._id] || []) : (a.permissions || []);

//             return (
//               <Card key={a._id} style={{ marginBottom: 12 }}>
//                 <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
//                   <View style={{ flex: 1 }}>
//                     <Text style={{ fontSize: 16, fontWeight: "900", color: colors.blue }}>
//                       {a.isSuperAdmin ? "Admin Principal" : "Admin Support"}
//                     </Text>
//                     <Text style={{ color: colors.grayText, marginTop: 2 }}>{a.email}</Text>
//                     {a.createdAt ? (
//                       <Text style={{ color: "#9CA3AF", marginTop: 4, fontSize: 12 }}>
//                         Créé le {new Date(a.createdAt).toLocaleDateString()}
//                       </Text>
//                     ) : null}

//                     <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 6 }}>
//                       {a.isSuperAdmin ? (
//                         <PermChip label="*" active />
//                       ) : (
//                         PERMS.map((p) => (
//                           <PermChip
//                             key={p.key}
//                             label={p.label}
//                             active={permsShown.includes(p.key)}
//                             editable={isEditing}
//                             onPress={() => toggleDraftPerm(a._id, p.key)}
//                           />
//                         ))
//                       )}
//                     </View>

//                     {/* Buttons save/cancel في edit mode */}
//                     {!a.isSuperAdmin && isEditing && (
//                       <View style={{ flexDirection: isWide ? "row" : "column", gap: 10 as any, marginTop: 14 }}>
//                         <View style={{ flex: 1 }}>
//                           <Button
//                             title={savingId === a._id ? "Enregistrement..." : "Enregistrer"}
//                             onPress={() => saveEdit(a._id)}
//                             disabled={savingId === a._id}
//                           />
//                         </View>
//                         <View style={{ flex: 1 }}>
//                           <Button title="Annuler" variant="ghost" onPress={cancelEdit} />
//                         </View>
//                       </View>
//                     )}
//                   </View>

//                   {/* Icons يمين مثل الصورة */}
//                   {!a.isSuperAdmin && (
//                     <View style={{ flexDirection: "row", gap: 10 as any }}>
//                       <Pressable onPress={() => (isEditing ? cancelEdit() : startEdit(a._id))} style={{ padding: 8 }}>
//                         <Text style={{ fontSize: 18 }}>✏️</Text>
//                       </Pressable>
//                       <Pressable onPress={() => onDelete(a._id)} style={{ padding: 8 }}>
//                         <Text style={{ fontSize: 18 }}>🗑️</Text>
//                       </Pressable>
//                     </View>
//                   )}
//                 </View>
//               </Card>
//             );
//           })
//         )}
//       </ScrollView>
//     </View>
//   );
// }

// admins.tsx (COMPLETE) — CRUD permissions table version
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   Pressable,
//   ActivityIndicator,
//   useWindowDimensions,
//   Alert,
//   Platform,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { Card, Input, Button } from "../src/ui/atoms";
// import { colors } from "../src/ui/theme";
// import {
//   getAdmins,
//   createAdmin,
//   deleteAdmin,
//   updateAdminPermissions,
//   AdminUser,
// } from "../src/services/admins.service";
// import { logout } from "../src/services/auth.service";

// import PermissionsTable from "../src/components/PermissionsTable";
// import { emptyPermissions } from "../src/constants/permissions";
// import type { PermissionsMap } from "../src/constants/permissions";

// function toast(title: string, message?: string) {
//   if (Platform.OS === "web") {
//     window.alert(message ? `${title}\n\n${message}` : title);
//   } else {
//     Alert.alert(title, message ?? "");
//   }
// }

// export default function AdminsScreen() {
//   const router = useRouter();
//   const { width } = useWindowDimensions();
//   const isWide = width >= 900;

//   const [admins, setAdmins] = useState<AdminUser[]>([]);
//   const [loading, setLoading] = useState(true);

//   // create block
//   const [showCreate, setShowCreate] = useState(false);
//   const [email, setEmail] = useState("");
//   const [createPerms, setCreatePerms] = useState<PermissionsMap>(emptyPermissions());
//   const [creating, setCreating] = useState(false);

//   // edit permissions per admin
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [draftPerms, setDraftPerms] = useState<Record<string, PermissionsMap>>({});
//   const [savingId, setSavingId] = useState<string | null>(null);

//   const title = useMemo(() => "Dashboard Super Admin", []);

//   const load = async () => {
//     setLoading(true);
//     try {
//       const list = await getAdmins();
//       setAdmins(list);

//       // init drafts (object permissions)
//       const map: Record<string, PermissionsMap> = {};
//       list.forEach((a) => {
//         map[a._id] = a.permissions ? a.permissions : emptyPermissions();
//       });
//       setDraftPerms(map);
//     } catch (e: any) {
//       if (e?.response?.status === 401) {
//         await logout();
//         router.replace("/login");
//         return;
//       }
//       toast("Erreur", "Impossible de charger les admins");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   const onCreate = async () => {
//     const mail = email.trim().toLowerCase();
//     if (!mail) return toast("Erreur", "Email obligatoire");
//     if (!mail.includes("@")) return toast("Erreur", "Email invalide");

//     // optional: require at least one permission checked
//     const hasAny =
//       Object.values(createPerms || {}).some((row) =>
//         Object.values(row || {}).some((v) => v === true),
//       );
//     if (!hasAny) return toast("Erreur", "Choisis au moins une permission");

//     setCreating(true);
//     try {
//       const res = await createAdmin(mail, createPerms);
//       toast("✅ Admin créé", `Email: ${res.email}\nPassword: ${res.password}`);

//       setEmail("");
//       setCreatePerms(emptyPermissions());
//       setShowCreate(false);
//       await load();
//     } catch (e: any) {
//       if (e?.response?.status === 401) {
//         await logout();
//         router.replace("/login");
//         return;
//       }
//       toast("Erreur", e?.response?.data?.message || "Création admin impossible");
//     } finally {
//       setCreating(false);
//     }
//   };

//   const startEdit = (id: string) => {
//     setEditingId(id);

//     // ensure draft exists
//     setDraftPerms((prev) => ({
//       ...prev,
//       [id]: prev[id] || emptyPermissions(),
//     }));
//   };

//   const cancelEdit = () => {
//     // reset drafts from server state
//     const map: Record<string, PermissionsMap> = {};
//     admins.forEach((a) => {
//       map[a._id] = a.permissions ? a.permissions : emptyPermissions();
//     });
//     setDraftPerms(map);
//     setEditingId(null);
//   };

//   const saveEdit = async (id: string) => {
//     const perms = draftPerms[id] || emptyPermissions();
//     setSavingId(id);
//     try {
//       await updateAdminPermissions(id, perms);
//       toast("✅ OK", "Permissions mises à jour");
//       setEditingId(null);
//       await load();
//     } catch (e: any) {
//       if (e?.response?.status === 401) {
//         await logout();
//         router.replace("/login");
//         return;
//       }
//       toast("Erreur", e?.response?.data?.message || "Update permissions impossible");
//     } finally {
//       setSavingId(null);
//     }
//   };

//   const onDelete = async (id: string) => {
//     const ok = Platform.OS === "web" ? window.confirm("Supprimer cet admin ?") : true;
//     if (!ok) return;

//     try {
//       await deleteAdmin(id);
//       await load();
//     } catch (e: any) {
//       if (e?.response?.status === 401) {
//         await logout();
//         router.replace("/login");
//         return;
//       }
//       toast("Erreur", "Suppression impossible");
//     }
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: colors.bg }}>
//       {/* Header */}
//       <View style={{ backgroundColor: colors.blue, paddingTop: 14, paddingBottom: 14 }}>
//         <View
//           style={{
//             paddingHorizontal: 16,
//             flexDirection: "row",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}
//         >
//           <View>
//             <Text style={{ color: "white", fontWeight: "900", fontSize: 18 }}>{title}</Text>
//             <Text style={{ color: "#BFDBFE", marginTop: 2, fontWeight: "600", fontSize: 12 }}>
//               Bienvenue, Super Administrateur
//             </Text>
//           </View>

//           <View style={{ width: 160 }}>
//             <Button
//               title="Déconnexion"
//               variant="ghost"
//               onPress={async () => {
//                 await logout();
//                 router.replace("/login");
//               }}
//             />
//           </View>
//         </View>
//       </View>

//       {/* Tabs */}
//       <View
//         style={{
//           flexDirection: "row",
//           backgroundColor: colors.white,
//           borderBottomWidth: 1,
//           borderBottomColor: colors.border,
//         }}
//       >
//         <Pressable style={{ flex: 1, alignItems: "center", paddingVertical: 14 }}>
//           <Text style={{ fontWeight: "800", color: colors.grayText }}>Vue Globale</Text>
//         </Pressable>
//         <Pressable
//           style={{
//             flex: 1,
//             alignItems: "center",
//             paddingVertical: 14,
//             borderBottomWidth: 3,
//             borderBottomColor: colors.orange,
//           }}
//         >
//           <Text style={{ fontWeight: "800", color: colors.orange }}>Admins</Text>
//         </Pressable>
//         <Pressable style={{ flex: 1, alignItems: "center", paddingVertical: 14 }}>
//           <Text style={{ fontWeight: "800", color: colors.grayText }}>Statistiques</Text>
//         </Pressable>
//       </View>

//       <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
//         {/* Title + button */}
//         <View
//           style={{
//             flexDirection: isWide ? "row" : "column",
//             justifyContent: "space-between",
//             alignItems: isWide ? "center" : "flex-start",
//             gap: 12 as any,
//             marginBottom: 14,
//           }}
//         >
//           <Text style={{ fontSize: 18, fontWeight: "900", color: colors.blue }}>
//             Gestion des Administrateurs
//           </Text>

//           <View style={{ width: isWide ? 220 : "100%" }}>
//             <Button
//               title={showCreate ? "Fermer" : "➕ Ajouter Admin"}
//               variant="orange"
//               onPress={() => setShowCreate((v) => !v)}
//             />
//           </View>
//         </View>

//         {/* Create Card */}
//         {showCreate && (
//           <Card style={{ marginBottom: 14 }}>
//             <Text style={{ fontSize: 16, fontWeight: "900", color: colors.blue }}>
//               Nouvel Administrateur
//             </Text>

//             <Text style={{ marginTop: 12, marginBottom: 6, fontWeight: "800", color: colors.blue }}>
//               Email
//             </Text>
//             <Input
//               value={email}
//               onChangeText={setEmail}
//               autoCapitalize="none"
//               placeholder="email@exemple.com"
//             />

//             <Text style={{ marginTop: 12, marginBottom: 8, fontWeight: "800", color: colors.blue }}>
//               Permissions (CRUD)
//             </Text>

//             <PermissionsTable value={createPerms} onChange={setCreatePerms} editable />

//             <View style={{ marginTop: 14 }}>
//               <Button title={creating ? "Création..." : "Créer"} onPress={onCreate} disabled={creating} />
//             </View>
//           </Card>
//         )}

//         {/* List */}
//         {loading ? (
//           <View style={{ padding: 20 }}>
//             <ActivityIndicator />
//             <Text style={{ textAlign: "center", marginTop: 10 }}>Chargement...</Text>
//           </View>
//         ) : (
//           admins.map((a) => {
//             const isEditing = editingId === a._id;
//             const permsValue = isEditing
//               ? draftPerms[a._id] || emptyPermissions()
//               : a.permissions || emptyPermissions();

//             return (
//               <Card key={a._id} style={{ marginBottom: 12 }}>
//                 <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
//                   <View style={{ flex: 1 }}>
//                     <Text style={{ fontSize: 16, fontWeight: "900", color: colors.blue }}>
//                       {a.isSuperAdmin ? "Admin Principal" : "Admin Support"}
//                     </Text>

//                     <Text style={{ color: colors.grayText, marginTop: 2 }}>{a.email}</Text>

//                     {a.createdAt ? (
//                       <Text style={{ color: "#9CA3AF", marginTop: 4, fontSize: 12 }}>
//                         Créé le {new Date(a.createdAt).toLocaleDateString()}
//                       </Text>
//                     ) : null}

//                     {/* Permissions */}
//                     {a.isSuperAdmin ? (
//                       <View style={{ marginTop: 10 }}>
//                         <Text style={{ fontWeight: "800", color: colors.grayText }}>
//                           Permissions: *
//                         </Text>
//                       </View>
//                     ) : (
//                       <View style={{ marginTop: 12 }}>
//                         <PermissionsTable
//                           value={permsValue}
//                           editable={isEditing}
//                           onChange={(next) =>
//                             setDraftPerms((prev) => ({
//                               ...prev,
//                               [a._id]: next,
//                             }))
//                           }
//                         />
//                       </View>
//                     )}

//                     {/* Buttons save/cancel in edit mode */}
//                     {!a.isSuperAdmin && isEditing && (
//                       <View style={{ flexDirection: isWide ? "row" : "column", gap: 10 as any, marginTop: 14 }}>
//                         <View style={{ flex: 1 }}>
//                           <Button
//                             title={savingId === a._id ? "Enregistrement..." : "Enregistrer"}
//                             onPress={() => saveEdit(a._id)}
//                             disabled={savingId === a._id}
//                           />
//                         </View>
//                         <View style={{ flex: 1 }}>
//                           <Button title="Annuler" variant="ghost" onPress={cancelEdit} />
//                         </View>
//                       </View>
//                     )}
//                   </View>

//                   {/* Icons */}
//                   {!a.isSuperAdmin && (
//                     <View style={{ flexDirection: "row", gap: 10 as any }}>
//                       <Pressable
//                         onPress={() => (isEditing ? cancelEdit() : startEdit(a._id))}
//                         style={{ padding: 8 }}
//                       >
//                         <Text style={{ fontSize: 18 }}>✏️</Text>
//                       </Pressable>
//                       <Pressable onPress={() => onDelete(a._id)} style={{ padding: 8 }}>
//                         <Text style={{ fontSize: 18 }}>🗑️</Text>
//                       </Pressable>
//                     </View>
//                   )}
//                 </View>
//               </Card>
//             );
//           })
//         )}
//       </ScrollView>
//     </View>
//   );
// }




// admins.tsx — show permissions SUMMARY, show TABLE only on edit
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   Pressable,
//   ActivityIndicator,
//   Alert,
//   Platform,
//   useWindowDimensions,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { Card, Input, Button } from "../src/ui/atoms";
// import { colors } from "../src/ui/theme";
// import {
//   getAdmins,
//   createAdmin,
//   deleteAdmin,
//   updateAdminPermissions,
//   AdminUser,
// } from "../src/services/admins.service";
// import { logout } from "../src/services/auth.service";

// import PermissionsTable from "../src/components/PermissionsTable";
// import { emptyPermissions, MODULES, ACTIONS } from "../src/constants/permissions";
// import type { PermissionsMap, CrudAction } from "../src/constants/permissions";

// function toast(title: string, message?: string) {
//   if (Platform.OS === "web") window.alert(message ? `${title}\n\n${message}` : title);
//   else Alert.alert(title, message ?? "");
// }

// function SummaryChip({ label }: { label: string }) {
//   return (
//     <View
//       style={{
//         paddingHorizontal: 10,
//         paddingVertical: 6,
//         borderRadius: 999,
//         marginRight: 8,
//         marginTop: 8,
//         backgroundColor: "#F3F4F6",
//         borderWidth: 1,
//         borderColor: "#E5E7EB",
//       }}
//     >
//       <Text style={{ color: colors.blue, fontWeight: "800", fontSize: 12 }}>{label}</Text>
//     </View>
//   );
// }

// function buildSummary(perms?: PermissionsMap) {
//   if (!perms) return [];
//   const lines: string[] = [];

//   MODULES.forEach((m) => {
//     const row = perms[m.key];
//     if (!row) return;

//     const enabled: string[] = [];
//     ACTIONS.forEach((a) => {
//       if (row[a.key as CrudAction] === true) enabled.push(a.label);
//     });

//     if (enabled.length > 0) {
//       lines.push(`${m.label}: ${enabled.join(", ")}`);
//     }
//   });

//   return lines;
// }

// export default function AdminsScreen() {
//   const router = useRouter();
//   const { width } = useWindowDimensions();
//   const isWide = width >= 900;

//   const [admins, setAdmins] = useState<AdminUser[]>([]);
//   const [loading, setLoading] = useState(true);

//   // create
//   const [showCreate, setShowCreate] = useState(false);
//   const [email, setEmail] = useState("");
//   const [createPerms, setCreatePerms] = useState<PermissionsMap>(emptyPermissions());
//   const [creating, setCreating] = useState(false);

//   // edit
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [draftPerms, setDraftPerms] = useState<Record<string, PermissionsMap>>({});
//   const [savingId, setSavingId] = useState<string | null>(null);

//   const title = useMemo(() => "Dashboard Super Admin", []);

//   const load = async () => {
//     setLoading(true);
//     try {
//       const list = await getAdmins();
//       setAdmins(list);

//       const map: Record<string, PermissionsMap> = {};
//       list.forEach((a) => {
//         map[a._id] = a.permissions ? a.permissions : emptyPermissions();
//       });
//       setDraftPerms(map);
//     } catch (e: any) {
//       if (e?.response?.status === 401) {
//         await logout();
//         router.replace("/login");
//         return;
//       }
//       toast("Erreur", "Impossible de charger les admins");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   const onCreate = async () => {
//     const mail = email.trim().toLowerCase();
//     if (!mail) return toast("Erreur", "Email obligatoire");
//     if (!mail.includes("@")) return toast("Erreur", "Email invalide");

//     // require at least one permission
//     const hasAny = Object.values(createPerms).some((row) => Object.values(row).some(Boolean));
//     if (!hasAny) return toast("Erreur", "Choisis au moins une permission");

//     setCreating(true);
//     try {
//       const res = await createAdmin(mail, createPerms);
//       toast("✅ Admin créé", `Email: ${res.email}\nPassword: ${res.password}`);

//       setEmail("");
//       setCreatePerms(emptyPermissions());
//       setShowCreate(false);
//       await load();
//     } catch (e: any) {
//       if (e?.response?.status === 401) {
//         await logout();
//         router.replace("/login");
//         return;
//       }
//       toast("Erreur", e?.response?.data?.message || "Création admin impossible");
//     } finally {
//       setCreating(false);
//     }
//   };

//   const startEdit = (id: string) => {
//     setEditingId(id);
//     setDraftPerms((prev) => ({ ...prev, [id]: prev[id] || emptyPermissions() }));
//   };

//   const cancelEdit = () => {
//     const map: Record<string, PermissionsMap> = {};
//     admins.forEach((a) => {
//       map[a._id] = a.permissions ? a.permissions : emptyPermissions();
//     });
//     setDraftPerms(map);
//     setEditingId(null);
//   };

//   const saveEdit = async (id: string) => {
//     const perms = draftPerms[id] || emptyPermissions();
//     setSavingId(id);
//     try {
//       await updateAdminPermissions(id, perms);
//       toast("✅ OK", "Permissions mises à jour");
//       setEditingId(null);
//       await load();
//     } catch (e: any) {
//       if (e?.response?.status === 401) {
//         await logout();
//         router.replace("/login");
//         return;
//       }
//       toast("Erreur", e?.response?.data?.message || "Update permissions impossible");
//     } finally {
//       setSavingId(null);
//     }
//   };

//   const onDelete = async (id: string) => {
//     const ok = Platform.OS === "web" ? window.confirm("Supprimer cet admin ?") : true;
//     if (!ok) return;

//     try {
//       await deleteAdmin(id);
//       await load();
//     } catch (e: any) {
//       if (e?.response?.status === 401) {
//         await logout();
//         router.replace("/login");
//         return;
//       }
//       toast("Erreur", "Suppression impossible");
//     }
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: colors.bg }}>
//       {/* Header */}
//       <View style={{ backgroundColor: colors.blue, paddingTop: 14, paddingBottom: 14 }}>
//         <View
//           style={{
//             paddingHorizontal: 16,
//             flexDirection: "row",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}
//         >
//           <View>
//             <Text style={{ color: "white", fontWeight: "900", fontSize: 18 }}>{title}</Text>
//             <Text style={{ color: "#BFDBFE", marginTop: 2, fontWeight: "600", fontSize: 12 }}>
//               Bienvenue, Super Administrateur
//             </Text>
//           </View>

//           <View style={{ width: 160 }}>
//             <Button
//               title="Déconnexion"
//               variant="ghost"
//               onPress={async () => {
//                 await logout();
//                 router.replace("/login");
//               }}
//             />
//           </View>
//         </View>
//       </View>

//       {/* Tabs */}
//       <View
//         style={{
//           flexDirection: "row",
//           backgroundColor: colors.white,
//           borderBottomWidth: 1,
//           borderBottomColor: colors.border,
//         }}
//       >
//         <Pressable style={{ flex: 1, alignItems: "center", paddingVertical: 14 }}>
//           <Text style={{ fontWeight: "800", color: colors.grayText }}>Vue Globale</Text>
//         </Pressable>
//         <Pressable
//           style={{
//             flex: 1,
//             alignItems: "center",
//             paddingVertical: 14,
//             borderBottomWidth: 3,
//             borderBottomColor: colors.orange,
//           }}
//         >
//           <Text style={{ fontWeight: "800", color: colors.orange }}>Admins</Text>
//         </Pressable>
//         <Pressable style={{ flex: 1, alignItems: "center", paddingVertical: 14 }}>
//           <Text style={{ fontWeight: "800", color: colors.grayText }}>Statistiques</Text>
//         </Pressable>
//       </View>

//       <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
//         {/* Title + button */}
//         <View
//           style={{
//             flexDirection: isWide ? "row" : "column",
//             justifyContent: "space-between",
//             alignItems: isWide ? "center" : "flex-start",
//             gap: 12 as any,
//             marginBottom: 14,
//           }}
//         >
//           <Text style={{ fontSize: 18, fontWeight: "900", color: colors.blue }}>
//             Gestion des Administrateurs
//           </Text>

//           <View style={{ width: isWide ? 220 : "100%" }}>
//             <Button
//               title={showCreate ? "Fermer" : "➕ Ajouter Admin"}
//               variant="orange"
//               onPress={() => setShowCreate((v) => !v)}
//             />
//           </View>
//         </View>

//         {/* Create Card (table always visible here) */}
//         {showCreate && (
//           <Card style={{ marginBottom: 14 }}>
//             <Text style={{ fontSize: 16, fontWeight: "900", color: colors.blue }}>
//               Nouvel Administrateur
//             </Text>

//             <Text style={{ marginTop: 12, marginBottom: 6, fontWeight: "800", color: colors.blue }}>
//               Email
//             </Text>
//             <Input
//               value={email}
//               onChangeText={setEmail}
//               autoCapitalize="none"
//               placeholder="email@exemple.com"
//             />

//             <Text style={{ marginTop: 12, marginBottom: 8, fontWeight: "800", color: colors.blue }}>
//               Permissions (CRUD)
//             </Text>
//             <PermissionsTable value={createPerms} onChange={setCreatePerms} editable />

//             <View style={{ marginTop: 14 }}>
//               <Button title={creating ? "Création..." : "Créer"} onPress={onCreate} disabled={creating} />
//             </View>
//           </Card>
//         )}

//         {/* List */}
//         {loading ? (
//           <View style={{ padding: 20 }}>
//             <ActivityIndicator />
//             <Text style={{ textAlign: "center", marginTop: 10 }}>Chargement...</Text>
//           </View>
//         ) : (
//           admins.map((a) => {
//             const isEditing = editingId === a._id;

//             const displayPerms = a.permissions || emptyPermissions();
//             const summary = buildSummary(displayPerms);

//             const editValue = draftPerms[a._id] || emptyPermissions();

//             return (
//               <Card key={a._id} style={{ marginBottom: 12 }}>
//                 <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
//                   <View style={{ flex: 1 }}>
//                     <Text style={{ fontSize: 16, fontWeight: "900", color: colors.blue }}>
//                       {a.isSuperAdmin ? "Admin Principal" : "Admin Support"}
//                     </Text>
//                     <Text style={{ color: colors.grayText, marginTop: 2 }}>{a.email}</Text>

//                     {a.createdAt ? (
//                       <Text style={{ color: "#9CA3AF", marginTop: 4, fontSize: 12 }}>
//                         Créé le {new Date(a.createdAt).toLocaleDateString()}
//                       </Text>
//                     ) : null}

//                     {/* ✅ Normal view: show summary only */}
//                     {!isEditing && !a.isSuperAdmin && (
//                       <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 6 }}>
//                         {summary.length === 0 ? (
//                           <Text style={{ marginTop: 10, color: "#9CA3AF", fontWeight: "700" }}>
//                             Aucune permission
//                           </Text>
//                         ) : (
//                           summary.map((line) => <SummaryChip key={line} label={line} />)
//                         )}
//                       </View>
//                     )}

//                     {/* ✅ Edit mode: show full table */}
//                     {isEditing && !a.isSuperAdmin && (
//                       <View style={{ marginTop: 12 }}>
//                         <PermissionsTable
//                           value={editValue}
//                           editable
//                           onChange={(next) =>
//                             setDraftPerms((prev) => ({
//                               ...prev,
//                               [a._id]: next,
//                             }))
//                           }
//                         />

//                         <View style={{ flexDirection: isWide ? "row" : "column", gap: 10 as any, marginTop: 14 }}>
//                           <View style={{ flex: 1 }}>
//                             <Button
//                               title={savingId === a._id ? "Enregistrement..." : "Enregistrer"}
//                               onPress={() => saveEdit(a._id)}
//                               disabled={savingId === a._id}
//                             />
//                           </View>
//                           <View style={{ flex: 1 }}>
//                             <Button title="Annuler" variant="ghost" onPress={cancelEdit} />
//                           </View>
//                         </View>
//                       </View>
//                     )}

//                     {/* Super admin display */}
//                     {a.isSuperAdmin && (
//                       <Text style={{ marginTop: 10, color: "#6B7280", fontWeight: "800" }}>
//                         Permissions: *
//                       </Text>
//                     )}
//                   </View>

//                   {/* Icons */}
//                   {!a.isSuperAdmin && (
//                     <View style={{ flexDirection: "row", gap: 10 as any }}>
//                       <Pressable
//                         onPress={() => (isEditing ? cancelEdit() : startEdit(a._id))}
//                         style={{ padding: 8 }}
//                       >
//                         <Text style={{ fontSize: 18 }}>✏️</Text>
//                       </Pressable>
//                       <Pressable onPress={() => onDelete(a._id)} style={{ padding: 8 }}>
//                         <Text style={{ fontSize: 18 }}>🗑️</Text>
//                       </Pressable>
//                     </View>
//                   )}
//                 </View>
//               </Card>
//             );
//           })
//         )}
//       </ScrollView>
//     </View>
//   );
// }


import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Card, Input, Button } from "../src/ui/atoms";
import { colors } from "../src/ui/theme";
import {
  getAdmins,
  createAdmin,
  deleteAdmin,
  updateAdminPermissions,
  AdminUser,
} from "../src/services/admins.service";
import { logout } from "../src/services/auth.service";
import PermissionsTable from "../src/components/PermissionsTable";
import { getPermissionModules } from "../src/services/permissions.service";
import type { PermissionModule, UserPermission, CrudAction } from "../src/constants/permissions";

function toast(title: string, message?: string) {
  if (Platform.OS === "web") window.alert(message ? `${title}\n\n${message}` : title);
  else Alert.alert(title, message ?? "");
}

function SummaryChip({ label }: { label: string }) {
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        marginRight: 8,
        marginTop: 8,
        backgroundColor: "#F3F4F6",
        borderWidth: 1,
        borderColor: "#E5E7EB",
      }}
    >
      <Text style={{ color: colors.blue, fontWeight: "800", fontSize: 12 }}>{label}</Text>
    </View>
  );
}

const ACTION_LABEL: Record<CrudAction, string> = {
  read: "Lire",
  create: "Créer",
  update: "Modifier",
  delete: "Supprimer",
};

const ACTIONS: CrudAction[] = ["read", "create", "update", "delete"];

/** ✅ normalize permissions from any old/new formats into UserPermission[] */
function normalizeUserPerms(raw: any): UserPermission[] {
  // super admin old format: ["*"]
  if (Array.isArray(raw) && raw.some((x) => x === "*")) return [];

  // new format: [{module, action}]
  if (Array.isArray(raw)) {
    return raw
      .filter(
        (x) =>
          x &&
          typeof x === "object" &&
          typeof x.module === "string" &&
          typeof x.action === "string"
      )
      .map((x) => ({ module: x.module, action: x.action as CrudAction }));
  }

  // old map format: { products:{read:true...}, orders:{...} }
  if (raw && typeof raw === "object") {
    const out: UserPermission[] = [];
    for (const module of Object.keys(raw)) {
      const row = raw[module];
      if (!row || typeof row !== "object") continue;
      ACTIONS.forEach((a) => {
        if (row[a] === true) out.push({ module, action: a });
      });
    }
    return out;
  }

  return [];
}

function buildSummary(modules: PermissionModule[], userPerms: UserPermission[]) {
  const out: string[] = [];
  modules.forEach((m) => {
    const acts = userPerms
      .filter((p) => p.module === m.module)
      .map((p) => ACTION_LABEL[p.action])
      .sort();

    if (acts.length) out.push(`${m.module}: ${acts.join(", ")}`);
  });
  return out;
}

export default function AdminsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [permissionModules, setPermissionModules] = useState<PermissionModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPerms, setLoadingPerms] = useState(true);

  // create
  const [showCreate, setShowCreate] = useState(false);
  const [email, setEmail] = useState("");
  const [createPerms, setCreatePerms] = useState<UserPermission[]>([]);
  const [creating, setCreating] = useState(false);

  // edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftPerms, setDraftPerms] = useState<Record<string, UserPermission[]>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const title = useMemo(() => "Dashboard Super Admin", []);

  const loadPermModules = async () => {
    setLoadingPerms(true);
    try {
      const mods = await getPermissionModules();
      mods.sort((a, b) => a.module.localeCompare(b.module));
      setPermissionModules(mods);
    } catch (e) {
      toast("Erreur", "Impossible de charger la liste des permissions");
    } finally {
      setLoadingPerms(false);
    }
  };

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const list = await getAdmins();
      setAdmins(list);

      const map: Record<string, UserPermission[]> = {};
      list.forEach((a) => {
        map[a._id] = normalizeUserPerms((a as any).permissions);
      });
      setDraftPerms(map);
    } catch (e: any) {
      if (e?.response?.status === 401) {
        await logout();
        router.replace("/login");
        return;
      }
      toast("Erreur", "Impossible de charger les admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermModules();
    loadAdmins();
  }, []);

  const onCreate = async () => {
    const mail = email.trim().toLowerCase();
    if (!mail) return toast("Erreur", "Email obligatoire");
    if (!mail.includes("@")) return toast("Erreur", "Email invalide");
    if (createPerms.length === 0) return toast("Erreur", "Choisis au moins une permission");

    setCreating(true);
    try {
      const res = await createAdmin(mail, createPerms);
      toast("✅ Admin créé", `Email: ${res.email}\nPassword: ${res.password}`);

      setEmail("");
      setCreatePerms([]);
      setShowCreate(false);
      await loadAdmins();
    } catch (e: any) {
      if (e?.response?.status === 401) {
        await logout();
        router.replace("/login");
        return;
      }
      toast("Erreur", e?.response?.data?.message || "Création admin impossible");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (id: string) => {
    setEditingId(id);
    setDraftPerms((prev) => ({ ...prev, [id]: prev[id] || [] }));
  };

  const cancelEdit = () => {
    const map: Record<string, UserPermission[]> = {};
    admins.forEach((a) => {
      map[a._id] = normalizeUserPerms((a as any).permissions);
    });
    setDraftPerms(map);
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    const perms = draftPerms[id] || [];
    setSavingId(id);
    try {
      await updateAdminPermissions(id, perms);
      toast("✅ OK", "Permissions mises à jour");
      setEditingId(null);
      await loadAdmins();
    } catch (e: any) {
      if (e?.response?.status === 401) {
        await logout();
        router.replace("/login");
        return;
      }
      toast("Erreur", e?.response?.data?.message || "Update permissions impossible");
    } finally {
      setSavingId(null);
    }
  };

  const onDelete = async (id: string) => {
    const ok = Platform.OS === "web" ? window.confirm("Supprimer cet admin ?") : true;
    if (!ok) return;

    try {
      await deleteAdmin(id);
      await loadAdmins();
    } catch (e: any) {
      if (e?.response?.status === 401) {
        await logout();
        router.replace("/login");
        return;
      }
      toast("Erreur", "Suppression impossible");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.blue, paddingTop: 14, paddingBottom: 14 }}>
        <View
          style={{
            paddingHorizontal: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text style={{ color: "white", fontWeight: "900", fontSize: 18 }}>{title}</Text>
            <Text style={{ color: "#BFDBFE", marginTop: 2, fontWeight: "600", fontSize: 12 }}>
              Bienvenue, Super Administrateur
            </Text>
          </View>

          <View style={{ width: 160 }}>
            <Button
              title="Déconnexion"
              variant="ghost"
              onPress={async () => {
                await logout();
                router.replace("/login");
              }}
            />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Title + button */}
        <View
          style={{
            flexDirection: isWide ? "row" : "column",
            justifyContent: "space-between",
            alignItems: isWide ? "center" : "flex-start",
            gap: 12 as any,
            marginBottom: 14,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "900", color: colors.blue }}>
            Gestion des Administrateurs
          </Text>

          <View style={{ width: isWide ? 220 : "100%" }}>
            <Button
              title={showCreate ? "Fermer" : "➕ Ajouter Admin"}
              variant="orange"
              onPress={() => setShowCreate((v) => !v)}
            />
          </View>
        </View>

        {/* Create Card */}
        {showCreate && (
          <Card style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 16, fontWeight: "900", color: colors.blue }}>
              Nouvel Administrateur
            </Text>

            <Text style={{ marginTop: 12, marginBottom: 6, fontWeight: "800", color: colors.blue }}>
              Email
            </Text>
            <Input value={email} onChangeText={setEmail} autoCapitalize="none" placeholder="email@exemple.com" />

            <Text style={{ marginTop: 12, marginBottom: 8, fontWeight: "800", color: colors.blue }}>
              Permissions
            </Text>

            {loadingPerms ? (
              <View style={{ paddingVertical: 10 }}>
                <ActivityIndicator />
              </View>
            ) : (
              <PermissionsTable
                modules={permissionModules}
                value={createPerms}
                onChange={setCreatePerms}
                editable
              />
            )}

            <View style={{ marginTop: 14 }}>
              <Button title={creating ? "Création..." : "Créer"} onPress={onCreate} disabled={creating} />
            </View>
          </Card>
        )}

        {/* List */}
        {loading ? (
          <View style={{ padding: 20 }}>
            <ActivityIndicator />
            <Text style={{ textAlign: "center", marginTop: 10 }}>Chargement...</Text>
          </View>
        ) : (
          admins.map((a) => {
            const isEditing = editingId === a._id;

            const userPerms = normalizeUserPerms((a as any).permissions);
            const summary = buildSummary(permissionModules, userPerms);

            const editValue = draftPerms[a._id] || userPerms;

            return (
              <Card key={a._id} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: "900", color: colors.blue }}>
                      {a.isSuperAdmin ? "Admin Principal" : "Admin Support"}
                    </Text>
                    <Text style={{ color: colors.grayText, marginTop: 2 }}>{a.email}</Text>

                    {/* Normal view: summary */}
                    {!a.isSuperAdmin && !isEditing && (
                      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 6 }}>
                        {summary.length === 0 ? (
                          <Text style={{ marginTop: 10, color: "#9CA3AF", fontWeight: "700" }}>
                            Aucune permission
                          </Text>
                        ) : (
                          summary.map((line) => <SummaryChip key={line} label={line} />)
                        )}
                      </View>
                    )}

                    {/* Edit mode: show table */}
                    {!a.isSuperAdmin && isEditing && (
                      <View style={{ marginTop: 12 }}>
                        {loadingPerms ? (
                          <ActivityIndicator />
                        ) : (
                          <PermissionsTable
                            modules={permissionModules}
                            value={editValue}
                            onChange={(next) =>
                              setDraftPerms((prev) => ({
                                ...prev,
                                [a._id]: next,
                              }))
                            }
                            editable
                          />
                        )}

                        <View style={{ flexDirection: isWide ? "row" : "column", gap: 10 as any, marginTop: 14 }}>
                          <View style={{ flex: 1 }}>
                            <Button
                              title={savingId === a._id ? "Enregistrement..." : "Enregistrer"}
                              onPress={() => saveEdit(a._id)}
                              disabled={savingId === a._id}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Button title="Annuler" variant="ghost" onPress={cancelEdit} />
                          </View>
                        </View>
                      </View>
                    )}

                    {/* SuperAdmin */}
                    {a.isSuperAdmin && (
                      <Text style={{ marginTop: 10, color: "#6B7280", fontWeight: "800" }}>
                        Permissions: *
                      </Text>
                    )}
                  </View>

                  {/* Icons */}
                  {!a.isSuperAdmin && (
                    <View style={{ flexDirection: "row", gap: 10 as any }}>
                      <Pressable
                        onPress={() => (isEditing ? cancelEdit() : startEdit(a._id))}
                        style={{ padding: 8 }}
                      >
                        <Text style={{ fontSize: 18 }}>✏️</Text>
                      </Pressable>
                      <Pressable onPress={() => onDelete(a._id)} style={{ padding: 8 }}>
                        <Text style={{ fontSize: 18 }}>🗑️</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
