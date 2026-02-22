// import React, { useEffect, useState } from "react";
// import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
// import { useRouter } from "expo-router";
// import { getStoredUser, getToken, logout } from "../src/services/auth.service";

// type Tab = "dashboard" | "products" | "orders" | "stats";
// type StoredUser = { sub: string; permissions?: string[]; isSuperAdmin?: boolean };

// const colors = {
//   blue: "#1E3A8A",
//   orange: "#F97316",
//   bg: "#F3F4F6",
//   white: "#FFFFFF",
//   grayText: "#6B7280",
//   border: "#E5E7EB",
//   green: "#10B981",
//   amber: "#F59E0B",
// };

// function Card({
//   children,
//   leftAccent,
// }: {
//   children: React.ReactNode;
//   leftAccent?: string;
// }) {
//   return (
//     <View
//       style={{
//         backgroundColor: colors.white,
//         borderRadius: 18,
//         padding: 16,
//         borderWidth: 1,
//         borderColor: colors.border,
//         borderLeftWidth: leftAccent ? 4 : 1,
//         borderLeftColor: leftAccent || colors.border,
//       }}
//     >
//       {children}
//     </View>
//   );
// }

// export default function Dashboard() {
//   const router = useRouter();
//   const [tab, setTab] = useState<Tab>("dashboard");
//   const [user, setUser] = useState<StoredUser | null>(null);
//   const [loading, setLoading] = useState(true);

//   const can = (perm: string) => {
//     const perms = user?.permissions || [];
//     return perms.includes("*") || perms.includes(perm);
//   };

//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       const token = await getToken();
//       if (!token) return router.replace("/login");
//       setUser((await getStoredUser()) as StoredUser);
//       setLoading(false);
//     })();
//   }, []);

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center" }}>
//         <ActivityIndicator />
//         <Text style={{ textAlign: "center", marginTop: 10 }}>Chargement...</Text>
//       </View>
//     );
//   }

//   const KPI = ({
//     title,
//     value,
//     accent,
//   }: {
//     title: string;
//     value: string;
//     accent: string;
//   }) => (
//     <View style={{ flex: 1, minWidth: 150 }}>
//       <Card leftAccent={accent}>
//         <Text style={{ fontSize: 20, fontWeight: "900", color: colors.blue }}>{value}</Text>
//         <Text style={{ color: colors.grayText, marginTop: 4 }}>{title}</Text>
//       </Card>
//     </View>
//   );

//   return (
//     <View style={{ flex: 1, backgroundColor: colors.bg }}>
//       {/* Header */}
//       <View style={{ backgroundColor: colors.blue, padding: 16 }}>
//         <Text style={{ color: "white", fontSize: 20, fontWeight: "900" }}>
//           Dashboard Admin
//         </Text>
//         <Text style={{ color: "#BFDBFE", marginTop: 4 }}>ID: {user?.sub}</Text>

//         <Pressable
//           onPress={async () => {
//             await logout();
//             router.replace("/login");
//           }}
//           style={{
//             marginTop: 12,
//             backgroundColor: "rgba(255,255,255,0.15)",
//             padding: 10,
//             borderRadius: 12,
//             alignSelf: "flex-start",
//           }}
//         >
//           <Text style={{ color: "white", fontWeight: "800" }}>Déconnexion</Text>
//         </Pressable>
//       </View>

//       {/* Content */}
//       <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 90 }}>
//         {tab === "dashboard" && (
//           <>
//             <Text style={{ fontSize: 20, fontWeight: "900", color: colors.blue, marginBottom: 12 }}>
//               Vue d'ensemble
//             </Text>

//             <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 as any }}>
//               <KPI title="Commandes" value="-" accent={colors.blue} />
//               <KPI title="Revenus" value="-" accent={colors.green} />
//               <KPI title="Stock Faible" value="-" accent={colors.orange} />
//               <KPI title="Taux Confirmation" value="-" accent={colors.amber} />
//             </View>

//             <Card leftAccent={colors.blue} >
//               <Text style={{ fontSize: 16, fontWeight: "900", color: colors.blue }}>
//                 Actions rapides
//               </Text>

//               <View style={{ flexDirection: "row", gap: 10 as any, marginTop: 10 }}>
//                 {can("PRODUCTS") && (
//                   <Pressable
//                     onPress={() => setTab("products")}
//                     style={{
//                       flex: 1,
//                       backgroundColor: colors.blue,
//                       padding: 12,
//                       borderRadius: 12,
//                     }}
//                   >
//                     <Text style={{ color: "white", fontWeight: "800", textAlign: "center" }}>
//                       Produits
//                     </Text>
//                   </Pressable>
//                 )}

//                 {can("ORDERS") && (
//                   <Pressable
//                     onPress={() => setTab("orders")}
//                     style={{
//                       flex: 1,
//                       backgroundColor: colors.orange,
//                       padding: 12,
//                       borderRadius: 12,
//                     }}
//                   >
//                     <Text style={{ color: "white", fontWeight: "800", textAlign: "center" }}>
//                       Commandes
//                     </Text>
//                   </Pressable>
//                 )}
//               </View>
//             </Card>

//             {/* SuperAdmin فقط */}
//             {(user?.permissions || []).includes("*") && (
//               <Pressable
//                 onPress={() => router.push("/admins")}
//                 style={{
//                   marginTop: 14,
//                   borderWidth: 1,
//                   borderColor: colors.border,
//                   padding: 12,
//                   borderRadius: 14,
//                   backgroundColor: "white",
//                 }}
//               >
//                 <Text style={{ textAlign: "center", fontWeight: "900", color: colors.blue }}>
//                   Admins (Super Admin)
//                 </Text>
//               </Pressable>
//             )}
//           </>
//         )}

//         {tab === "products" && (
//           <Card leftAccent={colors.blue}>
//             <Text style={{ fontWeight: "900", color: colors.blue }}>Produits</Text>
//             <Text style={{ marginTop: 6, color: colors.grayText }}>
//               TODO: écran produits (list + add/edit)
//             </Text>
//           </Card>
//         )}

//         {tab === "orders" && (
//           <Card leftAccent={colors.orange}>
//             <Text style={{ fontWeight: "900", color: colors.blue }}>Commandes</Text>
//             <Text style={{ marginTop: 6, color: colors.grayText }}>
//               TODO: écran commandes (confirmation)
//             </Text>
//           </Card>
//         )}

//         {tab === "stats" && (
//           <Card leftAccent={colors.amber}>
//             <Text style={{ fontWeight: "900", color: colors.blue }}>Statistiques</Text>
//             <Text style={{ marginTop: 6, color: colors.grayText }}>TODO</Text>
//           </Card>
//         )}
//       </ScrollView>

//       {/* Bottom Nav */}
//       <View
//         style={{
//           position: "absolute",
//           bottom: 0,
//           left: 0,
//           right: 0,
//           backgroundColor: "white",
//           borderTopWidth: 1,
//           borderTopColor: colors.border,
//         }}
//       >
//         <View style={{ flexDirection: "row" }}>
//           {[
//             { key: "dashboard", label: "Accueil" },
//             { key: "products", label: "Produits", perm: "PRODUCTS" },
//             { key: "orders", label: "Commandes", perm: "ORDERS" },
//             { key: "stats", label: "Stats", perm: "STATS" },
//           ].map((item) => {
//             if (item.perm && !can(item.perm)) return null;
//             const active = tab === (item.key as Tab);
//             return (
//               <Pressable
//                 key={item.key}
//                 onPress={() => setTab(item.key as Tab)}
//                 style={{
//                   flex: 1,
//                   paddingVertical: 12,
//                   alignItems: "center",
//                   backgroundColor: active ? "#EFF6FF" : "white",
//                 }}
//               >
//                 <Text style={{ color: active ? colors.blue : colors.grayText, fontWeight: "800" }}>
//                   {item.label}
//                 </Text>
//               </Pressable>
//             );
//           })}
//         </View>
//       </View>
//     </View>
//   );
// }
// apres add permission 
// dashboard.tsx (COMPLETE) — CRUD permissions (PermissionsMap) version
// import React, { useEffect, useState } from "react";
// import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
// import { useRouter } from "expo-router";
// import { getStoredUser, getToken, logout } from "../src/services/auth.service";
// import type { PermissionsMap } from "../src/constants/permissions";

// type Tab = "dashboard" | "products" | "orders" | "stats";

// type StoredUser = {
//   sub: string;
//   permissions?: PermissionsMap; // ✅ object
//   isSuperAdmin?: boolean;       // ✅ boolean
// };

// const colors = {
//   blue: "#1E3A8A",
//   orange: "#F97316",
//   bg: "#F3F4F6",
//   white: "#FFFFFF",
//   grayText: "#6B7280",
//   border: "#E5E7EB",
//   green: "#10B981",
//   amber: "#F59E0B",
// };

// function Card({
//   children,
//   leftAccent,
// }: {
//   children: React.ReactNode;
//   leftAccent?: string;
// }) {
//   return (
//     <View
//       style={{
//         backgroundColor: colors.white,
//         borderRadius: 18,
//         padding: 16,
//         borderWidth: 1,
//         borderColor: colors.border,
//         borderLeftWidth: leftAccent ? 4 : 1,
//         borderLeftColor: leftAccent || colors.border,
//       }}
//     >
//       {children}
//     </View>
//   );
// }

// export default function Dashboard() {
//   const router = useRouter();
//   const [tab, setTab] = useState<Tab>("dashboard");
//   const [user, setUser] = useState<StoredUser | null>(null);
//   const [loading, setLoading] = useState(true);

//   const can = (moduleKey: string, action: "read" | "create" | "update" | "delete") => {
//   if (user?.isSuperAdmin) return true;
//   const perms = user?.permissions || [];
//   return perms.some((p) => p.module === moduleKey && p.action === action);
// };


//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       const token = await getToken();
//       if (!token) {
//         router.replace("/login");
//         return;
//       }
//       setUser((await getStoredUser()) as StoredUser);
//       setLoading(false);
//     })();
//   }, []);

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center" }}>
//         <ActivityIndicator />
//         <Text style={{ textAlign: "center", marginTop: 10 }}>Chargement...</Text>
//       </View>
//     );
//   }

//   const KPI = ({
//     title,
//     value,
//     accent,
//   }: {
//     title: string;
//     value: string;
//     accent: string;
//   }) => (
//     <View style={{ flex: 1, minWidth: 150 }}>
//       <Card leftAccent={accent}>
//         <Text style={{ fontSize: 20, fontWeight: "900", color: colors.blue }}>{value}</Text>
//         <Text style={{ color: colors.grayText, marginTop: 4 }}>{title}</Text>
//       </Card>
//     </View>
//   );

//   // ✅ Bottom nav config with "can" function per tab
//   const NAV: { key: Tab; label: string; can?: () => boolean }[] = [
//     { key: "dashboard", label: "Accueil" },
//     { key: "products", label: "Produits", can: () => can("products", "read") },
//     { key: "orders", label: "Commandes", can: () => can("orders", "read") },
//     { key: "stats", label: "Stats", can: () => can("stats", "read") },
//   ];

//   return (
//     <View style={{ flex: 1, backgroundColor: colors.bg }}>
//       {/* Header */}
//       <View style={{ backgroundColor: colors.blue, padding: 16 }}>
//         <Text style={{ color: "white", fontSize: 20, fontWeight: "900" }}>
//           Dashboard Admin
//         </Text>
//         <Text style={{ color: "#BFDBFE", marginTop: 4 }}>ID: {user?.sub}</Text>

//         <Pressable
//           onPress={async () => {
//             await logout();
//             router.replace("/login");
//           }}
//           style={{
//             marginTop: 12,
//             backgroundColor: "rgba(255,255,255,0.15)",
//             padding: 10,
//             borderRadius: 12,
//             alignSelf: "flex-start",
//           }}
//         >
//           <Text style={{ color: "white", fontWeight: "800" }}>Déconnexion</Text>
//         </Pressable>
//       </View>

//       {/* Content */}
//       <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 90 }}>
//         {tab === "dashboard" && (
//           <>
//             <Text style={{ fontSize: 20, fontWeight: "900", color: colors.blue, marginBottom: 12 }}>
//               Vue d'ensemble
//             </Text>

//             <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 as any }}>
//               <KPI title="Commandes" value="-" accent={colors.blue} />
//               <KPI title="Revenus" value="-" accent={colors.green} />
//               <KPI title="Stock Faible" value="-" accent={colors.orange} />
//               <KPI title="Taux Confirmation" value="-" accent={colors.amber} />
//             </View>

//             <Card leftAccent={colors.blue}>
//               <Text style={{ fontSize: 16, fontWeight: "900", color: colors.blue }}>
//                 Actions rapides
//               </Text>

//               <View style={{ flexDirection: "row", gap: 10 as any, marginTop: 10 }}>
//                 {can("products", "read") && (
//                   <Pressable
//                     onPress={() => setTab("products")}
//                     style={{
//                       flex: 1,
//                       backgroundColor: colors.blue,
//                       padding: 12,
//                       borderRadius: 12,
//                     }}
//                   >
//                     <Text style={{ color: "white", fontWeight: "800", textAlign: "center" }}>
//                       Produits
//                     </Text>
//                   </Pressable>
//                 )}

//                 {can("orders", "read") && (
//                   <Pressable
//                     onPress={() => setTab("orders")}
//                     style={{
//                       flex: 1,
//                       backgroundColor: colors.orange,
//                       padding: 12,
//                       borderRadius: 12,
//                     }}
//                   >
//                     <Text style={{ color: "white", fontWeight: "800", textAlign: "center" }}>
//                       Commandes
//                     </Text>
//                   </Pressable>
//                 )}
//               </View>
//             </Card>

//             {/* ✅ SuperAdmin only */}
//             {user?.isSuperAdmin && (
//               <Pressable
//                 onPress={() => router.push("/admins")}
//                 style={{
//                   marginTop: 14,
//                   borderWidth: 1,
//                   borderColor: colors.border,
//                   padding: 12,
//                   borderRadius: 14,
//                   backgroundColor: "white",
//                 }}
//               >
//                 <Text style={{ textAlign: "center", fontWeight: "900", color: colors.blue }}>
//                   Admins (Super Admin)
//                 </Text>
//               </Pressable>
//             )}
//           </>
//         )}

//         {tab === "products" && (
//           <Card leftAccent={colors.blue}>
//             <Text style={{ fontWeight: "900", color: colors.blue }}>Produits</Text>
//             <Text style={{ marginTop: 6, color: colors.grayText }}>
//               TODO: écran produits (list + add/edit)
//             </Text>
//           </Card>
//         )}

//         {tab === "orders" && (
//           <Card leftAccent={colors.orange}>
//             <Text style={{ fontWeight: "900", color: colors.blue }}>Commandes</Text>
//             <Text style={{ marginTop: 6, color: colors.grayText }}>
//               TODO: écran commandes (confirmation)
//             </Text>
//           </Card>
//         )}

//         {tab === "stats" && (
//           <Card leftAccent={colors.amber}>
//             <Text style={{ fontWeight: "900", color: colors.blue }}>Statistiques</Text>
//             <Text style={{ marginTop: 6, color: colors.grayText }}>TODO</Text>
//           </Card>
//         )}
//       </ScrollView>

//       {/* Bottom Nav */}
//       <View
//         style={{
//           position: "absolute",
//           bottom: 0,
//           left: 0,
//           right: 0,
//           backgroundColor: "white",
//           borderTopWidth: 1,
//           borderTopColor: colors.border,
//         }}
//       >
//         <View style={{ flexDirection: "row" }}>
//           {NAV.map((item) => {
//             if (item.can && !item.can()) return null;

//             const active = tab === item.key;
//             return (
//               <Pressable
//                 key={item.key}
//                 onPress={() => setTab(item.key)}
//                 style={{
//                   flex: 1,
//                   paddingVertical: 12,
//                   alignItems: "center",
//                   backgroundColor: active ? "#EFF6FF" : "white",
//                 }}
//               >
//                 <Text style={{ color: active ? colors.blue : colors.grayText, fontWeight: "800" }}>
//                   {item.label}
//                 </Text>
//               </Pressable>
//             );
//           })}
//         </View>
//       </View>
//     </View>
//   );
// }
// dashboard.tsx — backend NEW (permissions array [{module, action}])
// import React, { useEffect, useState } from "react";
// import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
// import { useRouter } from "expo-router";
// import { getStoredUser, getToken, logout } from "../src/services/auth.service";
// import type { UserPermission, CrudAction } from "../src/constants/permissions";

// type Tab = "dashboard" | "products" | "orders" | "stats";

// type StoredUser = {
//   sub: string;
//   permissions?: UserPermission[]; // ✅ array
//   isSuperAdmin?: boolean;
// };

// const colors = {
//   blue: "#1E3A8A",
//   orange: "#F97316",
//   bg: "#F3F4F6",
//   white: "#FFFFFF",
//   grayText: "#6B7280",
//   border: "#E5E7EB",
//   green: "#10B981",
//   amber: "#F59E0B",
// };

// function Card({
//   children,
//   leftAccent,
// }: {
//   children: React.ReactNode;
//   leftAccent?: string;
// }) {
//   return (
//     <View
//       style={{
//         backgroundColor: colors.white,
//         borderRadius: 18,
//         padding: 16,
//         borderWidth: 1,
//         borderColor: colors.border,
//         borderLeftWidth: leftAccent ? 4 : 1,
//         borderLeftColor: leftAccent || colors.border,
//       }}
//     >
//       {children}
//     </View>
//   );
// }

// export default function Dashboard() {
//   const router = useRouter();
//   const [tab, setTab] = useState<Tab>("dashboard");
//   const [user, setUser] = useState<StoredUser | null>(null);
//   const [loading, setLoading] = useState(true);

//   // ✅ matches backend: permissions = [{module, action}]
//   const can = (moduleKey: string, action: CrudAction) => {
//     if (user?.isSuperAdmin) return true;
//     const perms = user?.permissions || [];
//     return perms.some((p) => p.module === moduleKey && p.action === action);
//   };

//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       const token = await getToken();
//       if (!token) {
//         router.replace("/login");
//         return;
//       }
//       setUser((await getStoredUser()) as StoredUser);
//       setLoading(false);
//     })();
//   }, []);

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center" }}>
//         <ActivityIndicator />
//         <Text style={{ textAlign: "center", marginTop: 10 }}>Chargement...</Text>
//       </View>
//     );
//   }

//   const KPI = ({
//     title,
//     value,
//     accent,
//   }: {
//     title: string;
//     value: string;
//     accent: string;
//   }) => (
//     <View style={{ flex: 1, minWidth: 150 }}>
//       <Card leftAccent={accent}>
//         <Text style={{ fontSize: 20, fontWeight: "900", color: colors.blue }}>{value}</Text>
//         <Text style={{ color: colors.grayText, marginTop: 4 }}>{title}</Text>
//       </Card>
//     </View>
//   );

//   const NAV: { key: Tab; label: string; can?: () => boolean }[] = [
//     { key: "dashboard", label: "Accueil" },
//     { key: "products", label: "Produits", can: () => can("products", "read") },
//     { key: "orders", label: "Commandes", can: () => can("orders", "read") },
//     { key: "stats", label: "Stats", can: () => can("stats", "read") },
//   ];

//   return (
//     <View style={{ flex: 1, backgroundColor: colors.bg }}>
//       {/* Header */}
//       <View style={{ backgroundColor: colors.blue, padding: 16 }}>
//         <Text style={{ color: "white", fontSize: 20, fontWeight: "900" }}>
//           Dashboard Admin
//         </Text>
//         <Text style={{ color: "#BFDBFE", marginTop: 4 }}>ID: {user?.sub}</Text>

//         <Pressable
//           onPress={async () => {
//             await logout();
//             router.replace("/login");
//           }}
//           style={{
//             marginTop: 12,
//             backgroundColor: "rgba(255,255,255,0.15)",
//             padding: 10,
//             borderRadius: 12,
//             alignSelf: "flex-start",
//           }}
//         >
//           <Text style={{ color: "white", fontWeight: "800" }}>Déconnexion</Text>
//         </Pressable>
//       </View>

//       {/* Content */}
//       <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 90 }}>
//         {tab === "dashboard" && (
//           <>
//             <Text style={{ fontSize: 20, fontWeight: "900", color: colors.blue, marginBottom: 12 }}>
//               Vue d'ensemble
//             </Text>

//             <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 as any }}>
//               <KPI title="Commandes" value="-" accent={colors.blue} />
//               <KPI title="Revenus" value="-" accent={colors.green} />
//               <KPI title="Stock Faible" value="-" accent={colors.orange} />
//               <KPI title="Taux Confirmation" value="-" accent={colors.amber} />
//             </View>

//             <Card leftAccent={colors.blue}>
//               <Text style={{ fontSize: 16, fontWeight: "900", color: colors.blue }}>
//                 Actions rapides
//               </Text>

//               <View style={{ flexDirection: "row", gap: 10 as any, marginTop: 10 }}>
//                 {can("products", "read") && (
//                   <Pressable
//                     onPress={() => setTab("products")}
//                     style={{
//                       flex: 1,
//                       backgroundColor: colors.blue,
//                       padding: 12,
//                       borderRadius: 12,
//                     }}
//                   >
//                     <Text style={{ color: "white", fontWeight: "800", textAlign: "center" }}>
//                       Produits
//                     </Text>
//                   </Pressable>
//                 )}

//                 {can("orders", "read") && (
//                   <Pressable
//                     onPress={() => setTab("orders")}
//                     style={{
//                       flex: 1,
//                       backgroundColor: colors.orange,
//                       padding: 12,
//                       borderRadius: 12,
//                     }}
//                   >
//                     <Text style={{ color: "white", fontWeight: "800", textAlign: "center" }}>
//                       Commandes
//                     </Text>
//                   </Pressable>
//                 )}
//               </View>
//             </Card>

//             {/* ✅ SuperAdmin only */}
//             {user?.isSuperAdmin && (
//               <Pressable
//                 onPress={() => router.push("/admins")}
//                 style={{
//                   marginTop: 14,
//                   borderWidth: 1,
//                   borderColor: colors.border,
//                   padding: 12,
//                   borderRadius: 14,
//                   backgroundColor: "white",
//                 }}
//               >
//                 <Text style={{ textAlign: "center", fontWeight: "900", color: colors.blue }}>
//                   Admins (Super Admin)
//                 </Text>
//               </Pressable>
//             )}
//           </>
//         )}

//         {tab === "products" && (
//           <Card leftAccent={colors.blue}>
//             <Text style={{ fontWeight: "900", color: colors.blue }}>Produits</Text>
//             <Text style={{ marginTop: 6, color: colors.grayText }}>
//               TODO: écran produits (list + add/edit)
//             </Text>
//           </Card>
//         )}

//         {tab === "orders" && (
//           <Card leftAccent={colors.orange}>
//             <Text style={{ fontWeight: "900", color: colors.blue }}>Commandes</Text>
//             <Text style={{ marginTop: 6, color: colors.grayText }}>
//               TODO: écran commandes (confirmation)
//             </Text>
//           </Card>
//         )}

//         {tab === "stats" && (
//           <Card leftAccent={colors.amber}>
//             <Text style={{ fontWeight: "900", color: colors.blue }}>Statistiques</Text>
//             <Text style={{ marginTop: 6, color: colors.grayText }}>TODO</Text>
//           </Card>
//         )}
//         {user?.isSuperAdmin && (
//   <Pressable
//     onPress={() => router.push("/permissions")}
//     style={{
//       marginTop: 12,
//       borderWidth: 1,
//       borderColor: colors.border,
//       padding: 12,
//       borderRadius: 14,
//       backgroundColor: "white",
//     }}
//   >
//     <Text style={{ textAlign: "center", fontWeight: "900", color: colors.blue }}>
//       Permissions
//     </Text>
//   </Pressable>
// )}

//       </ScrollView>

//       {/* Bottom Nav */}
//       <View
//         style={{
//           position: "absolute",
//           bottom: 0,
//           left: 0,
//           right: 0,
//           backgroundColor: "white",
//           borderTopWidth: 1,
//           borderTopColor: colors.border,
//         }}
//       >
//         <View style={{ flexDirection: "row" }}>
//           {NAV.map((item) => {
//             if (item.can && !item.can()) return null;

//             const active = tab === item.key;
//             return (
//               <Pressable
//                 key={item.key}
//                 onPress={() => setTab(item.key)}
//                 style={{
//                   flex: 1,
//                   paddingVertical: 12,
//                   alignItems: "center",
//                   backgroundColor: active ? "#EFF6FF" : "white",
//                 }}
//               >
//                 <Text style={{ color: active ? colors.blue : colors.grayText, fontWeight: "800" }}>
//                   {item.label}
//                 </Text>
//               </Pressable>
//             );
//           })}
//         </View>
//       </View>
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
  Platform,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { getStoredUser, getToken, logout } from "../src/services/auth.service";

type CrudAction = "read" | "create" | "update" | "delete";
type UserPermission = { module: string; action: CrudAction };

type Tab = "dashboard" | "products" | "orders" | "stats";

type StoredUser = {
  sub: string;
  permissions?: UserPermission[]; // ✅ array backend new
  isSuperAdmin?: boolean;
};

const colors = {
  blue: "#1E3A8A",
  orange: "#F97316",
  bg: "#F3F4F6",
  white: "#FFFFFF",
  grayText: "#6B7280",
  border: "#E5E7EB",
  green: "#10B981",
  amber: "#F59E0B",
  text: "#0F172A",
  softBlue: "#EFF6FF",
};

function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.white,
          borderRadius: 18,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function Pill({
  label,
  tone = "blue",
}: {
  label: string;
  tone?: "blue" | "green" | "orange" | "amber";
}) {
  const bg =
    tone === "green"
      ? "#ECFDF5"
      : tone === "orange"
      ? "#FFF7ED"
      : tone === "amber"
      ? "#FFFBEB"
      : "#EFF6FF";

  const text =
    tone === "green"
      ? "#065F46"
      : tone === "orange"
      ? "#9A3412"
      : tone === "amber"
      ? "#92400E"
      : colors.blue;

  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ color: text, fontWeight: "900", fontSize: 12 }}>{label}</Text>
    </View>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const [tab, setTab] = useState<Tab>("dashboard");
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);

  const can = (moduleKey: string, action: CrudAction) => {
    if (user?.isSuperAdmin) return true;
    const perms = user?.permissions || [];
    return perms.some((p) => p.module === moduleKey && p.action === action);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const token = await getToken();
      if (!token) return router.replace("/login");
      setUser((await getStoredUser()) as StoredUser);
      setLoading(false);
    })();
  }, []);

  const title = useMemo(() => "Dashboard", []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator />
        <Text style={{ textAlign: "center", marginTop: 10, color: colors.grayText }}>
          Chargement...
        </Text>
      </View>
    );
  }

  // ✅ KPI cards (horizontal scroll to avoid heavy layout)
  const KPI = ({
    label,
    value,
    tone,
  }: {
    label: string;
    value: string;
    tone: "blue" | "green" | "orange" | "amber";
  }) => (
    <View style={{ width: 220, marginRight: 12 }}>
      <Card style={{ borderRadius: 20 }}>
        <Pill label={label} tone={tone} />
        <Text style={{ fontSize: 26, fontWeight: "900", color: colors.text, marginTop: 10 }}>
          {value}
        </Text>
        <Text style={{ color: colors.grayText, marginTop: 4, fontWeight: "700" }}>
          Aujourd’hui
        </Text>
      </Card>
    </View>
  );

  const ActionCard = ({
    title,
    desc,
    tone,
    onPress,
  }: {
    title: string;
    desc: string;
    tone: "blue" | "orange" | "green" | "amber";
    onPress: () => void;
  }) => {
    const bg =
      tone === "green"
        ? "#ECFDF5"
        : tone === "orange"
        ? "#FFF7ED"
        : tone === "amber"
        ? "#FFFBEB"
        : "#EFF6FF";

    const border =
      tone === "green"
        ? "#A7F3D0"
        : tone === "orange"
        ? "#FED7AA"
        : tone === "amber"
        ? "#FDE68A"
        : "#BFDBFE";

    const t =
      tone === "green"
        ? "#065F46"
        : tone === "orange"
        ? "#9A3412"
        : tone === "amber"
        ? "#92400E"
        : colors.blue;

    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          flex: 1,
          minWidth: isWide ? 260 : 160,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: border,
          borderRadius: 18,
          padding: 14,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text style={{ fontWeight: "900", color: t, fontSize: 15 }}>{title}</Text>
        <Text style={{ color: t, opacity: 0.85, marginTop: 6, fontWeight: "700", fontSize: 12 }}>
          {desc}
        </Text>
      </Pressable>
    );
  };

  // Bottom nav config
  const NAV: { key: Tab; label: string; show?: () => boolean }[] = [
    { key: "dashboard", label: "Accueil" },
    { key: "products", label: "Produits", show: () => can("products", "read") },
    { key: "orders", label: "Commandes", show: () => can("orders", "read") },
    { key: "stats", label: "Stats", show: () => can("stats", "read") },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header (modern, smaller) */}
      <View
        style={{
          backgroundColor: colors.blue,
          paddingTop: 14,
          paddingBottom: 14,
          paddingHorizontal: 16,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={{ color: "white", fontSize: 18, fontWeight: "900" }}>
              {title} Admin
            </Text>
            <Text style={{ color: "#BFDBFE", marginTop: 2, fontWeight: "700", fontSize: 12 }}>
              ID: {user?.sub}
            </Text>

            <View style={{ marginTop: 10, flexDirection: "row", gap: 10 as any, flexWrap: "wrap" }}>
              <Pill label={user?.isSuperAdmin ? "Super Admin" : "Admin"} tone="blue" />
              <Pill label="E-commerce" tone="amber" />
            </View>
          </View>

          <Pressable
            onPress={async () => {
              await logout();
              router.replace("/login");
            }}
            style={({ pressed }) => ({
              backgroundColor: "rgba(255,255,255,0.16)",
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 14,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ color: "white", fontWeight: "900" }}>Déconnexion</Text>
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <>
            <Text style={{ fontSize: 20, fontWeight: "900", color: colors.text, marginBottom: 10 }}>
              Vue d’ensemble
            </Text>

            {/* KPI Horizontal */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              <KPI label="Commandes" value="—" tone="blue" />
              <KPI label="Revenus" value="—" tone="green" />
              <KPI label="Stock faible" value="—" tone="orange" />
              <KPI label="Taux confirmation" value="—" tone="amber" />
            </ScrollView>

            {/* Quick actions (NOT duplicate of bottom nav) */}
            <Card style={{ borderRadius: 22 }}>
              <Text style={{ fontSize: 16, fontWeight: "900", color: colors.text }}>
                Raccourcis
              </Text>
              <Text style={{ color: colors.grayText, marginTop: 4, fontWeight: "700" }}>
                Actions rapides sans surcharger le menu
              </Text>

              <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 12 as any }}>
                {can("products", "create") && (
                  <ActionCard
                    title="Ajouter un produit"
                    desc="Créer un nouveau produit"
                    tone="blue"
                    onPress={() => setTab("products")}
                  />
                )}

                {can("orders", "read") && (
                  <ActionCard
                    title="Voir les commandes"
                    desc="Suivi & confirmation"
                    tone="orange"
                    onPress={() => setTab("orders")}
                  />
                )}

                {user?.isSuperAdmin && (
                  <ActionCard
                    title="Admins"
                    desc="Gérer les comptes admin"
                    tone="green"
                    onPress={() => router.push("/admins")}
                  />
                )}

                {user?.isSuperAdmin && (
                  <ActionCard
                    title="Permissions"
                    desc="CRUD modules & actions"
                    tone="amber"
                    onPress={() => router.push("/permissions")}
                  />
                )}
              </View>
            </Card>

        
          </>
        )}

        {/* PRODUCTS */}
        {tab === "products" && (
          <Card style={{ borderRadius: 22 }}>
            <Text style={{ fontWeight: "900", color: colors.text, fontSize: 16 }}>Produits</Text>
            <Text style={{ marginTop: 6, color: colors.grayText, fontWeight: "700" }}>
              TODO: list + add/edit
            </Text>
          </Card>
        )}

        {/* ORDERS */}
        {tab === "orders" && (
          <Card style={{ borderRadius: 22 }}>
            <Text style={{ fontWeight: "900", color: colors.text, fontSize: 16 }}>Commandes</Text>
            <Text style={{ marginTop: 6, color: colors.grayText, fontWeight: "700" }}>
              TODO: confirmation, statut, livraison…
            </Text>
          </Card>
        )}

        {/* STATS */}
        {tab === "stats" && (
          <Card style={{ borderRadius: 22 }}>
            <Text style={{ fontWeight: "900", color: colors.text, fontSize: 16 }}>Statistiques</Text>
            <Text style={{ marginTop: 6, color: colors.grayText, fontWeight: "700" }}>
              TODO
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* Bottom Nav (single navigation only) */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: Platform.OS === "ios" ? 12 : 6,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          {NAV.map((item) => {
            if (item.show && !item.show()) return null;

            const active = tab === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => setTab(item.key)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  alignItems: "center",
                  backgroundColor: active ? colors.softBlue : "white",
                }}
              >
                <Text style={{ color: active ? colors.blue : colors.grayText, fontWeight: "900" }}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
