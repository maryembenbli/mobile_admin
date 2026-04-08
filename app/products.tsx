// import React, { useEffect, useMemo, useState } from "react";
// import * as ImagePicker from "expo-image-picker";
// import {
//   View,
//   Text,
//   ScrollView,
//   Pressable,
//   ActivityIndicator,
//   Alert,
//   Platform,
//   useWindowDimensions,
//   Image,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { Card, Input, Button } from "../src/ui/atoms";
// import { colors } from "../src/ui/theme";

// import {
//   getProducts,
//   createProduct,
//   updateProduct,
//   deleteProduct,
// } from "../src/services/products.service";

// import { getCategories } from "../src/services/categories.service";

// import type { Product, ProductPayload, ProductStatus } from "../src/types/product";
// import type { Category } from "../src/types/category";

// type ImageFile = { uri: string; name?: string; type?: string; file?: File };

// function toast(title: string, message?: string) {
//   if (Platform.OS === "web") window.alert(message ? `${title}\n\n${message}` : title);
//   else Alert.alert(title, message ?? "");
// }

// const STATUS: { key: ProductStatus; label: string }[] = [
//   { key: "affiche", label: "Affiché" },
//   { key: "cache", label: "Caché" },
//   { key: "rupture", label: "Rupture" },
//   { key: "lien", label: "Lien seulement" },
// ];

// const toNum = (v: any) => {
//   if (v === "" || v === null || v === undefined) return undefined;
//   const n = Number(String(v).replace(",", "."));
//   return Number.isFinite(n) ? n : undefined;
// };

// export default function ProductsScreen() {
//   const router = useRouter();
//   const { width } = useWindowDimensions();
//   const isWide = width >= 900;

//   // ✅ important: same as backend port
//   const API_URL = "http://localhost:3000";
//   const toImgUrl = (path?: string) => (path ? `${API_URL}${path}` : undefined);

//   const [list, setList] = useState<Product[]>([]);
//   const [cats, setCats] = useState<Category[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingCats, setLoadingCats] = useState(true);

//   // create/edit UI
//   const [showCreate, setShowCreate] = useState(false);
//   const [creating, setCreating] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [savingId, setSavingId] = useState<string | null>(null);

//   // picked images (new)
//   const [pickedImages, setPickedImages] = useState<ImageFile[]>([]);
//   // existing images (from DB, for edit preview)
//   const [existingImages, setExistingImages] = useState<string[]>([]);

//   // form
//   const [form, setForm] = useState({
//     name: "",
//     slug: "",
//     sku: "",
//     price: "",
//     oldPrice: "",
//     cost: "",
//      deliveryFee: "",
//     stock: "",
//     status: "affiche" as ProductStatus,
//     categories: [] as string[],
//     description: "",
//   });

//   const title = useMemo(() => "Gestion des Produits", []);

//   const load = async () => {
//     setLoading(true);
//     try {
//       const items = await getProducts();
//       setList(items);
//     } catch {
//       toast("Erreur", "Impossible de charger les produits");
//     } finally {
//       setLoading(false);
//     }
//   };
//   const [categoriesList, setCategoriesList] = useState<Category[]>([]);
//   const loadCategories = async () => {
//   try {
//     const data = await getCategories();
//     setCategoriesList(Array.isArray(data) ? data : []);
//   } catch (error) {
//     console.error("Erreur chargement catégories:", error);
//     setCategoriesList([]);
//   }
// };

// const unique = [...new Set(categoriesList.map((cat) => cat.name).filter(Boolean))];

//   const loadCats = async () => {
//     setLoadingCats(true);
//     try {
//       const items = await getCategories();
//       items.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
//       setCats(items);
//     } catch {
//       setCats([]);
//     } finally {
//       setLoadingCats(false);
//     }
//   };

//   useEffect(() => {
//     load();
//     loadCats();
//     loadCategories();
//   }, []);

//   const resetForm = () => {
//     setForm({
//       name: "",
//       slug: "",
//       sku: "",
//       price: "",
//       oldPrice: "",
//       cost: "",
//        deliveryFee: "",
//       stock: "",
//       status: "affiche",
//       categories: [],
//       description: "",
//     });
//     setPickedImages([]);
//     setExistingImages([]);
//   };

//   const startCreate = () => {
//     setEditingId(null);
//     resetForm();
//     setShowCreate(true);
//   };

//   const startEdit = (p: Product) => {
//     setShowCreate(false);
//     setEditingId(p._id);
//     setPickedImages([]);
//     setExistingImages(p.images ?? []);
//     setForm({
//       name: p.name || "",
//       slug: p.slug || "",
//       sku: p.sku || "",
//       price: p.price != null ? String(p.price) : "",
//       oldPrice: p.oldPrice != null ? String(p.oldPrice) : "",
//       cost: p.cost != null ? String(p.cost) : "",
//        deliveryFee: p.deliveryFee != null ? String(p.deliveryFee) : "",
//       stock: p.stock != null ? String(p.stock) : "",
//       status: (p.status as ProductStatus) || "affiche",
//       categories: Array.isArray(p.categories) ? p.categories : [],
//       description: p.description || "",
//     });
//   };

//   const pickImages = async () => {
//     // ✅ WEB
//     if (Platform.OS === "web") {
//       const input = document.createElement("input");
//       input.type = "file";
//       input.accept = "image/*";
//       input.multiple = true;

//       input.onchange = () => {
//         const files = Array.from(input.files || []);
//         const imgs: ImageFile[] = files.map((f) => ({
//           uri: URL.createObjectURL(f),
//           name: f.name,
//           type: f.type || "image/jpeg",
//           file: f,
//         }));
//         setPickedImages((prev) => [...prev, ...imgs]);
//       };

//       input.click();
//       return;
//     }

//     // ✅ MOBILE
//     const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!perm.granted) return toast("Permission", "Autorise l’accès à la galerie.");

//     const res = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsMultipleSelection: true,
//       quality: 0.85,
//     });

//     if (!res.canceled) {
//       const imgs: ImageFile[] = res.assets.map((a: any, idx: number) => ({
//         uri: a.uri,
//         name: a.fileName ?? `image_${Date.now()}_${idx}.jpg`,
//         type: a.mimeType ?? "image/jpeg",
//       }));
//       setPickedImages((prev) => [...prev, ...imgs]);
//     }
//   };

//   const removePicked = (index: number) => {
//     setPickedImages((prev) => prev.filter((_, i) => i !== index));
//   };

//   const toggleCategory = (catValue: string) => {
//     setForm((prev) => {
//       const exists = prev.categories.includes(catValue);
//       return {
//         ...prev,
//         categories: exists
//           ? prev.categories.filter((x) => x !== catValue)
//           : [...prev.categories, catValue],
//       };
//     });
//   };

//   const buildPayload = (): ProductPayload => {
//     return {
//       name: form.name.trim(),
//       slug: form.slug.trim() || undefined,
//       sku: form.sku.trim() || undefined,
//       price: toNum(form.price),
//       oldPrice: toNum(form.oldPrice),
//       cost: toNum(form.cost),
//       deliveryFee: toNum(form.deliveryFee),
//       stock: toNum(form.stock),
//       status: form.status,
//       categories: form.categories,
//       description: form.description || undefined,
//     };
//   };

//   const onSubmitCreate = async () => {
//     const name = form.name.trim();
//     if (!name) return toast("Erreur", "Nom obligatoire");
//     if (!pickedImages.length) return toast("Erreur", "Images obligatoires (au moins 1).");

//     const payload = buildPayload();
//     setCreating(true);

//     try {
//       await createProduct(payload, pickedImages);
//       toast("✅ OK", "Produit créé");
//       setShowCreate(false);
//       resetForm();
//       await load();
//     } catch (e: any) {
//       toast("Erreur", e?.response?.data?.message || "Création impossible");
//     } finally {
//       setCreating(false);
//     }
//   };

//   const onSubmitEdit = async () => {
//     if (!editingId) return;
//     const name = form.name.trim();
//     if (!name) return toast("Erreur", "Nom obligatoire");

//     // ✅ إذا تحب تخلي update يطلب صور جديدة: فعل هذا السطر
//     // if (!pickedImages.length) return toast("Erreur", "Choisir au moins 1 image pour modifier.");

//     const payload = buildPayload();
//     setSavingId(editingId);

//     try {
//       await updateProduct(editingId, payload, pickedImages);
//       toast("✅ OK", "Produit mis à jour");
//       setEditingId(null);
//       resetForm();
//       await load();
//     } catch (e: any) {
//       toast("Erreur", e?.response?.data?.message || "Update impossible");
//     } finally {
//       setSavingId(null);
//     }
//   };

//   const onDelete = async (id: string) => {
//     const ok = Platform.OS === "web" ? window.confirm("Supprimer ce produit ?") : true;
//     if (!ok) return;

//     try {
//       await deleteProduct(id);
//       toast("✅ OK", "Supprimé");
//       await load();
//     } catch (e: any) {
//       toast("Erreur", e?.response?.data?.message || "Suppression impossible");
//     }
//   };

//   const renderCategorySelector = () => {
//     const values = cats.map((c) => c.name).filter(Boolean) as string[];
//     const unique = Array.from(new Set(values));

//     if (loadingCats) {
//       return (
//         <View style={{ paddingVertical: 10 }}>
//           <ActivityIndicator />
//         </View>
//       );
//     }

//     if (unique.length === 0) {
//       const categoriesText = form.categories.join(", ");
//       return (
//         <>
//           <Text style={{ marginTop: 10, marginBottom: 6, fontWeight: "800", color: colors.blue }}>
//             Catégories (séparées par virgule)
//           </Text>
//           <Input
//             value={categoriesText}
//             onChangeText={(v) =>
//               setForm((prev) => ({
//                 ...prev,
//                 categories: v.split(",").map((x) => x.trim()).filter(Boolean),
//               }))
//             }
//             placeholder="ex: shoes, nike"
//           />
//         </>
//       );
//     }


// return (
//   <>
//     <Text style={{ marginTop: 10, marginBottom: 6, fontWeight: "800", color: colors.blue }}>
//       Catégories
//     </Text>

//     <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 as any }}>
//       {unique.map((val) => {
//         const active = form.categories.includes(val);

//         return (
//           <Pressable
//             key={val}
//             onPress={() => toggleCategory(val)}
//             style={{
//               paddingHorizontal: 12,
//               paddingVertical: 8,
//               borderRadius: 999,
//               borderWidth: 1,
//               borderColor: active ? colors.blue : "#E5E7EB",
//               backgroundColor: active ? "#EFF6FF" : "#F3F4F6",
//             }}
//           >
//             <Text style={{ fontWeight: "900", color: active ? colors.blue : "#6B7280" }}>
//               {val}
//             </Text>
//           </Pressable>
//         );
//       })}
//     </View>
//   </>
// );
// };
//   const renderImagesPicker = () => {
//     return (
//       <View style={{ marginTop: 12 }}>
//         <Text style={{ marginBottom: 6, fontWeight: "800", color: colors.blue }}>Images</Text>

//         {/* existing images preview (EDIT) */}
//         {editingId && existingImages.length > 0 && (
//           <View style={{ marginBottom: 10 }}>
//             <Text style={{ color: "#6B7280", fontWeight: "800", marginBottom: 6 }}>
//               Images actuelles
//             </Text>
//             <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 as any }}>
//               {existingImages.map((p) => {
//                 const url = toImgUrl(p);
//                 return (
//                   <Image
//                     key={p}
//                     source={{ uri: url }}
//                     style={{ width: 70, height: 70, borderRadius: 10 }}
//                   />
//                 );
//               })}
//             </View>
//           </View>
//         )}

//         <View style={{ flexDirection: isWide ? "row" : "column", gap: 10 as any }}>
//           <View style={{ flex: 1 }}>
//             <Button title="➕ Ajouter des images" variant="ghost" onPress={pickImages} />
//           </View>
//           <View style={{ flex: 1 }}>
//             <Button
//               title="Vider la sélection"
//               variant="orange"
//               onPress={() => setPickedImages([])}
//               disabled={pickedImages.length === 0}
//             />
//           </View>
//         </View>

//         {pickedImages.length > 0 && (
//           <View style={{ marginTop: 10 }}>
//             <Text style={{ color: "#6B7280", fontWeight: "800", marginBottom: 6 }}>
//               Nouvelles images sélectionnées
//             </Text>

//             {/* thumbnails */}
//             <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 as any }}>
//               {pickedImages.map((img, idx) => (
//                 <View key={`${img.uri}_${idx}`} style={{ width: 80 }}>
//                   <Image
//                     source={{ uri: img.uri }}
//                     style={{ width: 80, height: 80, borderRadius: 10 }}
//                   />
//                   <Pressable onPress={() => removePicked(idx)} style={{ padding: 6 }}>
//                     <Text style={{ textAlign: "center" }}>🗑️</Text>
//                   </Pressable>
//                 </View>
//               ))}
//             </View>
//           </View>
//         )}
//       </View>
//     );
//   };

//   const renderForm = (mode: "create" | "edit") => {
//     const submitting = mode === "create" ? creating : savingId === editingId;

//     return (
//       <Card style={{ marginBottom: 14 }}>
//         <Text style={{ fontSize: 16, fontWeight: "900", color: colors.blue }}>
//           {mode === "create" ? "Nouveau Produit" : "Modifier Produit"}
//         </Text>

//         <Text style={{ marginTop: 12, marginBottom: 6, fontWeight: "800", color: colors.blue }}>Nom</Text>
//         <Input value={form.name} onChangeText={(v) => setForm((p) => ({ ...p, name: v }))} placeholder="Nom du produit" />

//         <View style={{ flexDirection: isWide ? "row" : "column", gap: 10 as any, marginTop: 12 }}>
//           <View style={{ flex: 1 }}>
//             <Text style={{ marginBottom: 6, fontWeight: "800", color: colors.blue }}>Slug</Text>
//             <Input value={form.slug} onChangeText={(v) => setForm((p) => ({ ...p, slug: v }))} placeholder="nike-air-max-270" />
//           </View>
//           <View style={{ flex: 1 }}>
//             <Text style={{ marginBottom: 6, fontWeight: "800", color: colors.blue }}>SKU</Text>
//             <Input value={form.sku} onChangeText={(v) => setForm((p) => ({ ...p, sku: v }))} placeholder="NK270" />
//           </View>
//         </View>

//         <View style={{ flexDirection: isWide ? "row" : "column", gap: 10 as any, marginTop: 12 }}>
//           <View style={{ flex: 1 }}>
//             <Text style={{ marginBottom: 6, fontWeight: "800", color: colors.blue }}>Prix</Text>
//             <Input value={form.price} onChangeText={(v) => setForm((p) => ({ ...p, price: v }))} placeholder="180" keyboardType="numeric" />
//           </View>
//           <View style={{ flex: 1 }}>
//             <Text style={{ marginBottom: 6, fontWeight: "800", color: colors.blue }}>Ancien prix</Text>
//             <Input value={form.oldPrice} onChangeText={(v) => setForm((p) => ({ ...p, oldPrice: v }))} placeholder="220" keyboardType="numeric" />
//           </View>
//         </View>

//         <View style={{ flexDirection: isWide ? "row" : "column", gap: 10 as any, marginTop: 12 }}>
//           <View style={{ flex: 1 }}>
//             <Text style={{ marginBottom: 6, fontWeight: "800", color: colors.blue }}>Coût</Text>
//             <Input value={form.cost} onChangeText={(v) => setForm((p) => ({ ...p, cost: v }))} placeholder="100" keyboardType="numeric" />
//           </View>
//           <View style={{ flex: 1 }}>
//     <Text style={{ marginBottom: 6, fontWeight: "800", color: colors.blue }}>Frais de livraison</Text>
//     <Input
//       value={form.deliveryFee}
//       onChangeText={(v) => setForm((p) => ({ ...p, deliveryFee: v }))}
//       placeholder="7"
//       keyboardType="numeric"
//     />
//   </View>
//           <View style={{ flex: 1 }}>
//             <Text style={{ marginBottom: 6, fontWeight: "800", color: colors.blue }}>Stock</Text>
//             <Input value={form.stock} onChangeText={(v) => setForm((p) => ({ ...p, stock: v }))} placeholder="0" keyboardType="numeric" />
//           </View>
//         </View>

//         <Text style={{ marginTop: 12, marginBottom: 6, fontWeight: "800", color: colors.blue }}>Status</Text>
//         <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 as any }}>
//           {STATUS.map((s) => {
//             const active = form.status === s.key;
//             return (
//               <Pressable
//                 key={s.key}
//                 onPress={() => setForm((p) => ({ ...p, status: s.key }))}
//                 style={{
//                   paddingHorizontal: 12,
//                   paddingVertical: 8,
//                   borderRadius: 999,
//                   borderWidth: 1,
//                   borderColor: active ? colors.blue : "#E5E7EB",
//                   backgroundColor: active ? "#EFF6FF" : "#F3F4F6",
//                 }}
//               >
//                 <Text style={{ fontWeight: "900", color: active ? colors.blue : "#6B7280" }}>
//                   {s.label}
//                 </Text>
//               </Pressable>
//             );
//           })}
//         </View>

//         {renderCategorySelector()}

//         <Text style={{ marginTop: 12, marginBottom: 6, fontWeight: "800", color: colors.blue }}>Description</Text>
//         <Input
//           value={form.description}
//           onChangeText={(v) => setForm((p) => ({ ...p, description: v }))}
//           placeholder="<p>Chaussure confortable</p>"
//           multiline
//           style={{ minHeight: 90, textAlignVertical: "top" as any }}
//         />

//         {renderImagesPicker()}

//         <View style={{ flexDirection: isWide ? "row" : "column", gap: 10 as any, marginTop: 14 }}>
//           <View style={{ flex: 1 }}>
//             <Button
//               title={
//                 submitting
//                   ? mode === "create"
//                     ? "Création..."
//                     : "Enregistrement..."
//                   : mode === "create"
//                   ? "Créer"
//                   : "Enregistrer"
//               }
//               onPress={mode === "create" ? onSubmitCreate : onSubmitEdit}
//               disabled={submitting}
//             />
//           </View>

//           <View style={{ flex: 1 }}>
//             <Button
//               title="Annuler"
//               variant="ghost"
//               onPress={() => {
//                 setShowCreate(false);
//                 setEditingId(null);
//                 resetForm();
//               }}
//             />
//           </View>
//         </View>
//       </Card>
//     );
//   };

//   const ProductRowImage = ({ product }: { product: Product }) => {
//     const img = toImgUrl(product.images?.[0]);
//     return (
//       <View style={{ width: 70, height: 70, borderRadius: 10, overflow: "hidden", backgroundColor: "#E5E7EB" }}>
//         {img ? (
//           <Image source={{ uri: img }} style={{ width: 70, height: 70 }} resizeMode="cover" />
//         ) : null}
//       </View>
//     );
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: colors.bg }}>
//       {/* Header */}
//       <View style={{ backgroundColor: colors.blue, paddingTop: 14, paddingBottom: 14 }}>
//         <View style={{ paddingHorizontal: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
//           <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
//             <Text style={{ color: "white", fontWeight: "900" }}>←</Text>
//           </Pressable>

//           <View style={{ flex: 1 }}>
//             <Text style={{ color: "white", fontWeight: "900", fontSize: 18 }}>{title}</Text>
//             <Text style={{ color: "#BFDBFE", marginTop: 2, fontWeight: "600", fontSize: 12 }}>
//               Super Admin
//             </Text>
//           </View>

//           <View style={{ width: 170 }}>
//             <Button
//               title={showCreate ? "Fermer" : "➕ Nouveau"}
//               variant="orange"
//               onPress={() => (showCreate ? setShowCreate(false) : startCreate())}
//             />
//           </View>
//         </View>
//       </View>

//       <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
//         <View style={{ marginBottom: 12 }}>
//           <Button title="📁 Gérer les catégories" variant="ghost" onPress={() => router.push("/categories")} />
//         </View>

//         {showCreate && renderForm("create")}
//         {editingId && renderForm("edit")}

//         {/* List */}
//         {loading ? (
//           <View style={{ padding: 20 }}>
//             <ActivityIndicator />
//             <Text style={{ textAlign: "center", marginTop: 10 }}>Chargement...</Text>
//           </View>
//         ) : isWide ? (
//           <Card>
//             <Text style={{ fontWeight: "900", color: colors.blue, marginBottom: 10 }}>Produits</Text>

//             {list.length === 0 ? (
//               <Text style={{ color: "#6B7280", fontWeight: "700" }}>Aucun produit</Text>
//             ) : (
//               list.map((p) => (
//                 <View
//                   key={p._id}
//                   style={{
//                     flexDirection: "row",
//                     alignItems: "center",
//                     paddingVertical: 12,
//                     borderTopWidth: 1,
//                     borderTopColor: "#E5E7EB",
//                     gap: 12 as any,
//                   }}
//                 >
//                   {/* ✅ IMAGE */}
//                   <ProductRowImage product={p} />

//                   <View style={{ flex: 2 }}>
//                     <Text style={{ fontWeight: "900" }}>{p.name}</Text>
//                     <Text style={{ color: "#6B7280", marginTop: 2 }}>
//                       SKU: {p.sku || "-"}  •  Slug: {p.slug || "-"}
//                     </Text>
//                     <Text style={{ color: "#6B7280", marginTop: 2 }}>
//                       Catégories: {(p.categories || []).join(", ") || "-"}
//                     </Text>
//                   </View>

//                   <View style={{ flex: 1 }}>
//                     <Text style={{ fontWeight: "900" }}>{p.price ?? 0} dt</Text>
//                     <Text style={{ color: "#6B7280" }}>Old: {p.oldPrice ?? 0} dt</Text>
//                     <Text style={{ color: "#6B7280" }}>Cost: {p.cost ?? 0} dt</Text>
//                   </View>

//                   <View style={{ flex: 1 }}>
//                     <Text style={{ fontWeight: "900" }}>Stock: {p.stock ?? 0}</Text>
//                     <Text style={{ fontWeight: "900", color: colors.blue }}>Status: {p.status || "-"}</Text>
//                   </View>

//                   <View style={{ flexDirection: "row", gap: 10 as any }}>
//                     <Button title="✏️" variant="ghost" onPress={() => startEdit(p)} />
//                     <Button title="🗑️" variant="orange" onPress={() => onDelete(p._id)} />
//                   </View>
//                 </View>
//               ))
//             )}
//           </Card>
//         ) : (
//           list.map((p) => {
//             const img = toImgUrl(p.images?.[0]);
//             return (
//               <Card key={p._id} style={{ marginBottom: 12 }}>
//                 <View style={{ flexDirection: "row", gap: 12 as any }}>
//                   <View style={{ width: 72, height: 72, borderRadius: 10, overflow: "hidden", backgroundColor: "#E5E7EB" }}>
//                     {img ? <Image source={{ uri: img }} style={{ width: 72, height: 72 }} /> : null}
//                   </View>

//                   <View style={{ flex: 1 }}>
//                     <Text style={{ fontSize: 16, fontWeight: "900", color: colors.blue }}>{p.name}</Text>

//                     <Text style={{ color: "#6B7280", marginTop: 4, fontWeight: "700" }}>
//                       SKU: {p.sku || "-"} • {p.price ?? 0} dt
//                     </Text>

//                     <Text style={{ color: "#6B7280", marginTop: 4, fontWeight: "700" }}>
//                       Stock: {p.stock ?? 0} • Status: {p.status || "-"}
//                     </Text>

//                     <Text style={{ color: "#6B7280", marginTop: 4 }}>
//                       Catégories: {(p.categories || []).join(", ") || "-"}
//                     </Text>
//                   </View>

//                   <View style={{ flexDirection: "row", gap: 10 as any }}>
//                     <Pressable onPress={() => startEdit(p)} style={{ padding: 8 }}>
//                       <Text style={{ fontSize: 18 }}>✏️</Text>
//                     </Pressable>
//                     <Pressable onPress={() => onDelete(p._id)} style={{ padding: 8 }}>
//                       <Text style={{ fontSize: 18 }}>🗑️</Text>
//                     </Pressable>
//                   </View>
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
import * as ImagePicker from "expo-image-picker";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
  useWindowDimensions,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Badge, Button, Card, Input, SectionTitle } from "../src/ui/atoms";
import { RichTextEditor } from "../src/components/RichTextEditor";
import { colors } from "../src/ui/theme";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../src/services/products.service";

import { getCategories } from "../src/services/categories.service";

import type { Product, ProductPayload, ProductStatus } from "../src/types/product";
import type { Category } from "../src/types/category";

type ImageFile = { uri: string; name?: string; type?: string; file?: File };

function toast(title: string, message?: string) {
  if (Platform.OS === "web") window.alert(message ? `${title}\n\n${message}` : title);
  else Alert.alert(title, message ?? "");
}

const STATUS: { key: ProductStatus; label: string }[] = [
  { key: "affiche", label: "Affiché" },
  { key: "cache", label: "Caché" },
  { key: "rupture", label: "Rupture" },
  { key: "lien", label: "Lien seulement" },
];

const toNum = (v: any) => {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
};

export default function ProductsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  // ✅ important: same as backend port
  const API_URL = "http://localhost:3000";
  const toImgUrl = (path?: string) => (path ? `${API_URL}${path}` : undefined);

  const [list, setList] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCats, setLoadingCats] = useState(true);

  // create/edit UI
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  // picked images (new)
  const [pickedImages, setPickedImages] = useState<ImageFile[]>([]);
  // existing images (from DB, for edit preview)
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // form
  const [form, setForm] = useState({
    name: "",
    slug: "",
    sku: "",
    price: "",
    oldPrice: "",
    cost: "",
     deliveryFee: "",
    stock: "",
    status: "affiche" as ProductStatus,
    categories: [] as string[],
    description: "",
  });

  const title = useMemo(() => "Gestion des Produits", []);

  const load = async () => {
    setLoading(true);
    try {
      const items = await getProducts();
      setList(items);
    } catch {
      toast("Erreur", "Impossible de charger les produits");
    } finally {
      setLoading(false);
    }
  };
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const loadCategories = async () => {
  try {
    const data = await getCategories();
    setCategoriesList(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Erreur chargement catégories:", error);
    setCategoriesList([]);
  }
};

const unique = [...new Set(categoriesList.map((cat) => cat.name).filter(Boolean))];

  const loadCats = async () => {
    setLoadingCats(true);
    try {
      const items = await getCategories();
      items.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      setCats(items);
    } catch {
      setCats([]);
    } finally {
      setLoadingCats(false);
    }
  };

  useEffect(() => {
    load();
    loadCats();
    loadCategories();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      slug: "",
      sku: "",
      price: "",
      oldPrice: "",
      cost: "",
       deliveryFee: "",
      stock: "",
      status: "affiche",
      categories: [],
      description: "",
    });
    setPickedImages([]);
    setExistingImages([]);
  };

  const startCreate = () => {
    setEditingId(null);
    resetForm();
    setShowCreate(true);
  };

  const startEdit = (p: Product) => {
    setShowCreate(false);
    setEditingId(p._id);
    setPickedImages([]);
    setExistingImages(p.images ?? []);
    setForm({
      name: p.name || "",
      slug: p.slug || "",
      sku: p.sku || "",
      price: p.price != null ? String(p.price) : "",
      oldPrice: p.oldPrice != null ? String(p.oldPrice) : "",
      cost: p.cost != null ? String(p.cost) : "",
       deliveryFee: p.deliveryFee != null ? String(p.deliveryFee) : "",
      stock: p.stock != null ? String(p.stock) : "",
      status: (p.status as ProductStatus) || "affiche",
      categories: Array.isArray(p.categories) ? p.categories : [],
      description: p.description || "",
    });
  };

  const pickImages = async () => {
    // ✅ WEB
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.multiple = true;

      input.onchange = () => {
        const files = Array.from(input.files || []);
        const imgs: ImageFile[] = files.map((f) => ({
          uri: URL.createObjectURL(f),
          name: f.name,
          type: f.type || "image/jpeg",
          file: f,
        }));
        setPickedImages((prev) => [...prev, ...imgs]);
      };

      input.click();
      return;
    }

    // ✅ MOBILE
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return toast("Permission", "Autorise l’accès à la galerie.");

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.85,
    });

    if (!res.canceled) {
      const imgs: ImageFile[] = res.assets.map((a: any, idx: number) => ({
        uri: a.uri,
        name: a.fileName ?? `image_${Date.now()}_${idx}.jpg`,
        type: a.mimeType ?? "image/jpeg",
      }));
      setPickedImages((prev) => [...prev, ...imgs]);
    }
  };

  const removePicked = (index: number) => {
    setPickedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleCategory = (catValue: string) => {
    setForm((prev) => {
      const exists = prev.categories.includes(catValue);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((x) => x !== catValue)
          : [...prev.categories, catValue],
      };
    });
  };

  const buildPayload = (): ProductPayload => {
    return {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      sku: form.sku.trim() || undefined,
      price: toNum(form.price),
      oldPrice: toNum(form.oldPrice),
      cost: toNum(form.cost),
      deliveryFee: toNum(form.deliveryFee),
      stock: toNum(form.stock),
      status: form.status,
      categories: form.categories,
      description: form.description || undefined,
    };
  };

  const onSubmitCreate = async () => {
    const name = form.name.trim();
    if (!name) return toast("Erreur", "Nom obligatoire");
    if (!pickedImages.length) return toast("Erreur", "Images obligatoires (au moins 1).");

    const payload = buildPayload();
    setCreating(true);

    try {
      await createProduct(payload, pickedImages);
      toast("✅ OK", "Produit créé");
      setShowCreate(false);
      resetForm();
      await load();
    } catch (e: any) {
      toast("Erreur", e?.response?.data?.message || "Création impossible");
    } finally {
      setCreating(false);
    }
  };

  const onSubmitEdit = async () => {
    if (!editingId) return;
    const name = form.name.trim();
    if (!name) return toast("Erreur", "Nom obligatoire");

    // ✅ إذا تحب تخلي update يطلب صور جديدة: فعل هذا السطر
    // if (!pickedImages.length) return toast("Erreur", "Choisir au moins 1 image pour modifier.");

    const payload = buildPayload();
    setSavingId(editingId);

    try {
      await updateProduct(editingId, payload, pickedImages);
      toast("✅ OK", "Produit mis à jour");
      setEditingId(null);
      resetForm();
      await load();
    } catch (e: any) {
      toast("Erreur", e?.response?.data?.message || "Update impossible");
    } finally {
      setSavingId(null);
    }
  };

  const onDelete = async (id: string) => {
    const ok = Platform.OS === "web" ? window.confirm("Supprimer ce produit ?") : true;
    if (!ok) return;

    try {
      await deleteProduct(id);
      toast("✅ OK", "Supprimé");
      await load();
    } catch (e: any) {
      toast("Erreur", e?.response?.data?.message || "Suppression impossible");
    }
  };

  const renderCategorySelector = () => {
    const values = cats.map((c) => c.name).filter(Boolean) as string[];
    const unique = Array.from(new Set(values));

    if (loadingCats) {
      return (
        <View style={{ paddingVertical: 10 }}>
          <ActivityIndicator />
        </View>
      );
    }

    if (unique.length === 0) {
      const categoriesText = form.categories.join(", ");
      return (
        <>
          <Text style={{ marginTop: 10, marginBottom: 6, fontWeight: "800", color: colors.blue }}>
            Catégories (séparées par virgule)
          </Text>
          <Input
            value={categoriesText}
            onChangeText={(v) =>
              setForm((prev) => ({
                ...prev,
                categories: v.split(",").map((x) => x.trim()).filter(Boolean),
              }))
            }
            placeholder="ex: shoes, nike"
          />
        </>
      );
    }


return (
  <>
    <Text style={{ marginTop: 10, marginBottom: 6, fontWeight: "800", color: colors.blue }}>
      Catégories
    </Text>

    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 as any }}>
      {unique.map((val) => {
        const active = form.categories.includes(val);

        return (
          <Pressable
            key={val}
            onPress={() => toggleCategory(val)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: active ? colors.blue : "#E5E7EB",
              backgroundColor: active ? "#EFF6FF" : "#F3F4F6",
            }}
          >
            <Text style={{ fontWeight: "900", color: active ? colors.blue : "#6B7280" }}>
              {val}
            </Text>
          </Pressable>
        );
      })}
    </View>
  </>
);
};
  const renderImagesPicker = () => {
    return (
      <View style={{ marginTop: 12 }}>
        <Text style={{ marginBottom: 6, fontWeight: "800", color: colors.blue }}>Images</Text>

        {/* existing images preview (EDIT) */}
        {editingId && existingImages.length > 0 && (
          <View style={{ marginBottom: 10 }}>
            <Text style={{ color: "#6B7280", fontWeight: "800", marginBottom: 6 }}>
              Images actuelles
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 as any }}>
              {existingImages.map((p) => {
                const url = toImgUrl(p);
                return (
                  <Image
                    key={p}
                    source={{ uri: url }}
                    style={{ width: 70, height: 70, borderRadius: 10 }}
                  />
                );
              })}
            </View>
          </View>
        )}

        <View style={{ flexDirection: isWide ? "row" : "column", gap: 10 as any }}>
          <View style={{ flex: 1 }}>
            <Button title="➕ Ajouter des images" variant="ghost" onPress={pickImages} />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title="Vider la sélection"
              variant="orange"
              onPress={() => setPickedImages([])}
              disabled={pickedImages.length === 0}
            />
          </View>
        </View>

        {pickedImages.length > 0 && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ color: "#6B7280", fontWeight: "800", marginBottom: 6 }}>
              Nouvelles images sélectionnées
            </Text>

            {/* thumbnails */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 as any }}>
              {pickedImages.map((img, idx) => (
                <View key={`${img.uri}_${idx}`} style={{ width: 80 }}>
                  <Image
                    source={{ uri: img.uri }}
                    style={{ width: 80, height: 80, borderRadius: 10 }}
                  />
                  <Pressable onPress={() => removePicked(idx)} style={{ padding: 6 }}>
                    <Text style={{ textAlign: "center" }}>🗑️</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderForm = (mode: "create" | "edit") => {
    const submitting = mode === "create" ? creating : savingId === editingId;

    return (
      <Card style={{ marginBottom: 14 }}>
        <Text style={{ fontSize: 16, fontWeight: "900", color: colors.blue }}>
          {mode === "create" ? "Nouveau Produit" : "Modifier Produit"}
        </Text>

        <Text style={{ marginTop: 12, marginBottom: 6, fontWeight: "800", color: colors.blue }}>Nom</Text>
        <Input value={form.name} onChangeText={(v) => setForm((p) => ({ ...p, name: v }))} placeholder="Nom du produit" />

        <View style={{ flexDirection: isWide ? "row" : "column", gap: 10 as any, marginTop: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ marginBottom: 6, fontWeight: "800", color: colors.blue }}>Slug</Text>
            <Input value={form.slug} onChangeText={(v) => setForm((p) => ({ ...p, slug: v }))} placeholder="nike-air-max-270" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ marginBottom: 6, fontWeight: "800", color: colors.blue }}>SKU</Text>
            <Input value={form.sku} onChangeText={(v) => setForm((p) => ({ ...p, sku: v }))} placeholder="NK270" />
          </View>
        </View>

        <View style={{ flexDirection: isWide ? "row" : "column", gap: 10 as any, marginTop: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ marginBottom: 6, fontWeight: "800", color: colors.blue }}>Prix</Text>
            <Input value={form.price} onChangeText={(v) => setForm((p) => ({ ...p, price: v }))} placeholder="180" keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ marginBottom: 6, fontWeight: "800", color: colors.blue }}>Ancien prix</Text>
            <Input value={form.oldPrice} onChangeText={(v) => setForm((p) => ({ ...p, oldPrice: v }))} placeholder="220" keyboardType="numeric" />
          </View>
        </View>

        <View style={{ flexDirection: isWide ? "row" : "column", gap: 10 as any, marginTop: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ marginBottom: 6, fontWeight: "800", color: colors.blue }}>Coût</Text>
            <Input value={form.cost} onChangeText={(v) => setForm((p) => ({ ...p, cost: v }))} placeholder="100" keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
    <Text style={{ marginBottom: 6, fontWeight: "800", color: colors.blue }}>Frais de livraison</Text>
    <Input
      value={form.deliveryFee}
      onChangeText={(v) => setForm((p) => ({ ...p, deliveryFee: v }))}
      placeholder="7"
      keyboardType="numeric"
    />
  </View>
          <View style={{ flex: 1 }}>
            <Text style={{ marginBottom: 6, fontWeight: "800", color: colors.blue }}>Stock</Text>
            <Input value={form.stock} onChangeText={(v) => setForm((p) => ({ ...p, stock: v }))} placeholder="0" keyboardType="numeric" />
          </View>
        </View>

        <Text style={{ marginTop: 12, marginBottom: 6, fontWeight: "800", color: colors.blue }}>Status</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 as any }}>
          {STATUS.map((s) => {
            const active = form.status === s.key;
            return (
              <Pressable
                key={s.key}
                onPress={() => setForm((p) => ({ ...p, status: s.key }))}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: active ? colors.blue : "#E5E7EB",
                  backgroundColor: active ? "#EFF6FF" : "#F3F4F6",
                }}
              >
                <Text style={{ fontWeight: "900", color: active ? colors.blue : "#6B7280" }}>
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {renderCategorySelector()}

        <Text style={{ marginTop: 12, marginBottom: 6, fontWeight: "800", color: colors.blue }}>Description</Text>
        <RichTextEditor
          value={form.description}
          onChange={(v) => setForm((p) => ({ ...p, description: v }))}
          placeholder="Description detaillee du produit..."
        />

        {renderImagesPicker()}

        <View style={{ flexDirection: isWide ? "row" : "column", gap: 10 as any, marginTop: 14 }}>
          <View style={{ flex: 1 }}>
            <Button
              title={
                submitting
                  ? mode === "create"
                    ? "Création..."
                    : "Enregistrement..."
                  : mode === "create"
                  ? "Créer"
                  : "Enregistrer"
              }
              onPress={mode === "create" ? onSubmitCreate : onSubmitEdit}
              disabled={submitting}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Button
              title="Annuler"
              variant="ghost"
              onPress={() => {
                setShowCreate(false);
                setEditingId(null);
                resetForm();
              }}
            />
          </View>
        </View>
      </Card>
    );
  };

  const ProductRowImage = ({ product }: { product: Product }) => {
    const img = toImgUrl(product.images?.[0]);
    return (
      <View style={{ width: 70, height: 70, borderRadius: 10, overflow: "hidden", backgroundColor: "#E5E7EB" }}>
        {img ? (
          <Image source={{ uri: img }} style={{ width: 70, height: 70 }} resizeMode="cover" />
        ) : null}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={{ display: "none", backgroundColor: colors.blue, paddingTop: 14, paddingBottom: 14 }}>
        <View style={{ paddingHorizontal: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
            <Text style={{ color: "white", fontWeight: "900" }}>←</Text>
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text style={{ color: "white", fontWeight: "900", fontSize: 18 }}>{title}</Text>
            <Text style={{ color: "#BFDBFE", marginTop: 2, fontWeight: "600", fontSize: 12 }}>
              Super Admin
            </Text>
          </View>

          <View style={{ width: 170 }}>
            <Button
              title={showCreate ? "Fermer" : "➕ Nouveau"}
              variant="orange"
              onPress={() => (showCreate ? setShowCreate(false) : startCreate())}
            />
          </View>
        </View>
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
          <View style={{ flex: 1 }}>
            <Badge label="CATALOGUE NOVIKA" tone="blue" />
            <View style={{ marginTop: 10 }}>
              <SectionTitle
                title={title}
                subtitle="Centralise le catalogue, les prix, les medias et les categories dans une presentation moderne et claire."
              />
            </View>
          </View>

          <View style={{ width: isWide ? 210 : "100%" }}>
            <Button
              title={showCreate ? "Fermer" : "Nouveau produit"}
              variant="orange"
              onPress={() => (showCreate ? setShowCreate(false) : startCreate())}
            />
          </View>
        </View>
        <View style={{ marginBottom: 12, display: "none" as any }}>
          <Button title="📁 Gérer les catégories" variant="ghost" onPress={() => router.push("/categories")} />
        </View>

        {showCreate && renderForm("create")}
        {editingId && renderForm("edit")}

        {/* List */}
        {loading ? (
          <View style={{ padding: 20 }}>
            <ActivityIndicator />
            <Text style={{ textAlign: "center", marginTop: 10 }}>Chargement...</Text>
          </View>
        ) : isWide ? (
          <Card>
            <Text style={{ fontWeight: "900", color: colors.blue, marginBottom: 10 }}>Produits</Text>

            {list.length === 0 ? (
              <Text style={{ color: "#6B7280", fontWeight: "700" }}>Aucun produit</Text>
            ) : (
              list.map((p) => (
                <View
                  key={p._id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    borderTopWidth: 1,
                    borderTopColor: "#E5E7EB",
                    gap: 12 as any,
                  }}
                >
                  {/* ✅ IMAGE */}
                  <ProductRowImage product={p} />

                  <View style={{ flex: 2 }}>
                    <Text style={{ fontWeight: "900" }}>{p.name}</Text>
                    <Text style={{ color: "#6B7280", marginTop: 2 }}>
                      SKU: {p.sku || "-"}  •  Slug: {p.slug || "-"}
                    </Text>
                    <Text style={{ color: "#6B7280", marginTop: 2 }}>
                      Catégories: {(p.categories || []).join(", ") || "-"}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "900" }}>{p.price ?? 0} dt</Text>
                    <Text style={{ color: "#6B7280" }}>Old: {p.oldPrice ?? 0} dt</Text>
                    <Text style={{ color: "#6B7280" }}>Cost: {p.cost ?? 0} dt</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "900" }}>Stock: {p.stock ?? 0}</Text>
                    <Text style={{ fontWeight: "900", color: colors.blue }}>Status: {p.status || "-"}</Text>
                  </View>

                  <View style={{ flexDirection: "row", gap: 10 as any }}>
                    <Button title="✏️" variant="ghost" onPress={() => startEdit(p)} />
                    <Button title="🗑️" variant="orange" onPress={() => onDelete(p._id)} />
                  </View>
                </View>
              ))
            )}
          </Card>
        ) : (
          list.map((p) => {
            const img = toImgUrl(p.images?.[0]);
            return (
              <Card key={p._id} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: "row", gap: 12 as any }}>
                  <View style={{ width: 72, height: 72, borderRadius: 10, overflow: "hidden", backgroundColor: "#E5E7EB" }}>
                    {img ? <Image source={{ uri: img }} style={{ width: 72, height: 72 }} /> : null}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: "900", color: colors.blue }}>{p.name}</Text>

                    <Text style={{ color: "#6B7280", marginTop: 4, fontWeight: "700" }}>
                      SKU: {p.sku || "-"} • {p.price ?? 0} dt
                    </Text>

                    <Text style={{ color: "#6B7280", marginTop: 4, fontWeight: "700" }}>
                      Stock: {p.stock ?? 0} • Status: {p.status || "-"}
                    </Text>

                    <Text style={{ color: "#6B7280", marginTop: 4 }}>
                      Catégories: {(p.categories || []).join(", ") || "-"}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", gap: 10 as any }}>
                    <Pressable onPress={() => startEdit(p)} style={{ padding: 8 }}>
                      <Text style={{ fontSize: 18 }}>✏️</Text>
                    </Pressable>
                    <Pressable onPress={() => onDelete(p._id)} style={{ padding: 8 }}>
                      <Text style={{ fontSize: 18 }}>🗑️</Text>
                    </Pressable>
                  </View>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
