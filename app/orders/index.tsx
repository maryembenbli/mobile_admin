// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   Image,
//   Modal,
//   Pressable,
//   RefreshControl,
//   ScrollView,
//   Switch,
//   Text,
//   View,
//   useWindowDimensions,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { Button, Card, Input } from "../../src/ui/atoms";
// import { colors } from "../../src/ui/theme";
// import {
//   archiveOrder,
//   createOrder,
//   deleteOrder,
//   getOrders,
//   restoreOrder,
// } from "../../src/services/orders.service";
// import { getProducts } from "../../src/services/products.service";
// import { getEnabledDeliveryProviders } from "../../src/services/delivery-integrations.service";
// import { playNewOrderAlert } from "../../src/services/order-alert.service";
// import { logout } from "../../src/services/auth.service";
// import type { Order, OrderItem, OrderStatus } from "../../src/types/order";
// import type { Product } from "../../src/types/product";
// import type { DeliveryProvider } from "../../src/types/delivery";

// const API_URL = "http://127.0.0.1:3000";

// const TUNISIA_CITIES = [
//   "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Zaghouan", "Bizerte", "Beja",
//   "Jendouba", "Kef", "Siliana", "Sousse", "Monastir", "Mahdia", "Sfax", "Kairouan",
//   "Kasserine", "Sidi Bouzid", "Gabes", "Medenine", "Tataouine", "Gafsa", "Tozeur", "Kebili",
// ];

// const PERIOD_OPTIONS = [
//   { key: "all", label: "Choisissez une periode" },
//   { key: "today", label: "Aujourd'hui" },
//   { key: "7d", label: "7 derniers jours" },
//   { key: "30d", label: "30 derniers jours" },
//   { key: "month", label: "Ce mois" },
// ] as const;

// type PeriodFilter = (typeof PERIOD_OPTIONS)[number]["key"];

// const STATUS_OPTIONS: { key: "all" | OrderStatus; label: string }[] = [
//   { key: "all", label: "Statut" },
//   { key: "en_attente", label: "En attente" },
//   { key: "confirmee", label: "Confirmee" },
//   { key: "tentative1", label: "Tentative 1" },
//   { key: "emballee", label: "Emballee" },
//   { key: "livree", label: "Livree" },
//   { key: "rejetee", label: "Rejetee" },
//   { key: "retournee", label: "Retournee" },
// ];

// type FilterSelectOption<T extends string> = { key: T; label: string };

// type CreateFormState = {
//   customerName: string;
//   phone: string;
//   city: string;
//   address: string;
//   email: string;
//   customerNote: string;
//   deliveryCompany: string;
//   exchange: boolean;
// };

// type CreateOrderLine = {
//   productId: string;
//   name: string;
//   image?: string | null;
//   quantity: string;
//   unitPrice: number;
//   deliveryFee: number;
// };

// type OrdersTab = "commandes" | "abandonnee" | "supprimee" | "archivee";

// const INITIAL_FORM: CreateFormState = {
//   customerName: "",
//   phone: "",
//   city: "",
//   address: "",
//   email: "",
//   customerNote: "",
//   deliveryCompany: "",
//   exchange: false,
// };

// function formatDate(value?: string) {
//   if (!value) return "-";
//   return new Date(value).toLocaleString();
// }

// function formatMoney(value: number) {
//   return `${Number(value || 0).toFixed(2)} DT`;
// }

// function matchesPeriod(value: string | undefined, period: PeriodFilter) {
//   if (period === "all") return true;
//   if (!value) return false;
//   const orderDate = new Date(value);
//   const now = new Date();
//   if (period === "today") return orderDate.toDateString() === now.toDateString();
//   if (period === "month") {
//     return orderDate.getFullYear() === now.getFullYear() && orderDate.getMonth() === now.getMonth();
//   }
//   const diff = now.getTime() - orderDate.getTime();
//   const days = diff / (1000 * 60 * 60 * 24);
//   if (period === "7d") return days <= 7;
//   if (period === "30d") return days <= 30;
//   return true;
// }

// function getStatusTheme(status: OrderStatus) {
//   switch (status) {
//     case "confirmee":
//       return { bg: "#DCFCE7", text: "#166534", border: "#BBF7D0" };
//     case "livree":
//       return { bg: "#DBEAFE", text: "#1D4ED8", border: "#BFDBFE" };
//     case "emballee":
//       return { bg: "#EDE9FE", text: "#6D28D9", border: "#DDD6FE" };
//     case "tentative1":
//       return { bg: "#FFEDD5", text: "#C2410C", border: "#FED7AA" };
//     case "rejetee":
//     case "retournee":
//       return { bg: "#FEE2E2", text: "#B91C1C", border: "#FECACA" };
//     default:
//       return { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" };
//   }
// }

// function getProductTitle(item: OrderItem) {
//   if (typeof item.product === "string") return item.product;
//   return item.product?.name || item.product?.title || item.product?._id || "Produit";
// }

// function getProductImage(item: OrderItem) {
//   if (typeof item.product === "string") return null;
//   const path = item.product?.images?.[0] || item.product?.image;
//   if (!path) return null;
//   return path.startsWith("http") ? path : `${API_URL}${path}`;
// }

// function StatusBadge({ status, onPress }: { status: OrderStatus; onPress?: () => void }) {
//   const theme = getStatusTheme(status);
//   return (
//     <Pressable
//       onPress={onPress}
//       style={{
//         backgroundColor: theme.bg,
//         borderRadius: 999,
//         borderWidth: 1,
//         borderColor: theme.border,
//         paddingHorizontal: 12,
//         paddingVertical: 7,
//         alignSelf: "flex-start",
//       }}
//     >
//       <Text style={{ color: theme.text, fontWeight: "900", fontSize: 12 }}>{status}</Text>
//     </Pressable>
//   );
// }

// function FilterSelect<T extends string>({
//   value,
//   options,
//   onChange,
//   title,
//   renderSelected,
//   renderOption,
// }: {
//   value: T;
//   options: readonly FilterSelectOption<T>[];
//   onChange: (value: T) => void;
//   title?: string;
//   renderSelected?: (option: FilterSelectOption<T>) => React.ReactNode;
//   renderOption?: (option: FilterSelectOption<T>, active: boolean) => React.ReactNode;
// }) {
//   const [open, setOpen] = useState(false);
//   const selected = options.find((item) => item.key === value) || options[0];

//   return (
//     <View style={{ minWidth: 180 }}>
//       <Pressable
//         onPress={() => setOpen((current) => !current)}
//         style={{
//           minHeight: 54,
//           borderRadius: 14,
//           borderWidth: 1,
//           borderColor: colors.border,
//           backgroundColor: "white",
//           paddingHorizontal: 16,
//           paddingVertical: 12,
//           flexDirection: "row",
//           alignItems: "center",
//           justifyContent: "space-between",
//         }}
//       >
//         <View style={{ flex: 1 }}>
//           {renderSelected ? (
//             renderSelected(selected)
//           ) : (
//             <Text style={{ color: selected.key === options[0]?.key ? "#94A3B8" : "#0F172A", fontWeight: "700" }}>
//               {selected.label}
//             </Text>
//           )}
//         </View>
//         <Text style={{ color: "#64748B", fontWeight: "900", marginLeft: 10 }}>⌄</Text>
//       </Pressable>

//       <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
//         <Pressable
//           onPress={() => setOpen(false)}
//           style={{
//             flex: 1,
//             backgroundColor: "rgba(15,23,42,0.22)",
//             justifyContent: "center",
//             padding: 20,
//           }}
//         >
//           <Pressable
//             onPress={(event) => event.stopPropagation()}
//             style={{
//               width: "100%",
//               maxWidth: 460,
//               alignSelf: "center",
//               borderRadius: 18,
//               borderWidth: 1,
//               borderColor: colors.border,
//               backgroundColor: "white",
//               overflow: "hidden",
//             }}
//           >
//             <View
//               style={{
//                 paddingHorizontal: 16,
//                 paddingVertical: 14,
//                 borderBottomWidth: 1,
//                 borderBottomColor: colors.border,
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//               }}
//             >
//               <Text style={{ color: "#0F172A", fontWeight: "900", fontSize: 18 }}>
//                 {title || "Selection"}
//               </Text>
//               <Pressable onPress={() => setOpen(false)}>
//                 <Text style={{ color: colors.grayText, fontWeight: "900", fontSize: 18 }}>✕</Text>
//               </Pressable>
//             </View>

//             <ScrollView nestedScrollEnabled style={{ maxHeight: 320 }}>
//               <View style={{ padding: 10, gap: 8 }}>
//                 {options.map((option) => {
//                   const active = option.key === value;
//                   return (
//                     <Pressable
//                       key={option.key}
//                       onPress={() => {
//                         onChange(option.key);
//                         setOpen(false);
//                       }}
//                       style={{
//                         borderRadius: 12,
//                         borderWidth: 1,
//                         borderColor: active ? colors.blue : colors.border,
//                         backgroundColor: active ? "#EFF6FF" : "white",
//                         paddingHorizontal: 12,
//                         paddingVertical: 10,
//                       }}
//                     >
//                       {renderOption ? (
//                         renderOption(option, active)
//                       ) : (
//                         <Text style={{ color: active ? colors.blue : "#334155", fontWeight: "700" }}>
//                           {option.label}
//                         </Text>
//                       )}
//                     </Pressable>
//                   );
//                 })}
//               </View>
//             </ScrollView>
//           </Pressable>
//         </Pressable>
//       </Modal>
//     </View>
//   );
// }

// function HistoryPopover({ order }: { order: Order | null }) {
//   if (!order) return null;

//   return (
//     <Card style={{ minWidth: 270, maxWidth: 320, borderStyle: "dashed", borderColor: "#A855F7" }}>
//       <Text style={{ color: "#0F172A", fontWeight: "900", fontSize: 16 }}>{order.customerName}</Text>
//       <View style={{ marginTop: 12, gap: 12 }}>
//         {(order.history || []).map((entry, index) => (
//           <View
//             key={`${entry.status}-${entry.date}-${index}`}
//             style={{
//               gap: 6,
//               paddingBottom: 10,
//               borderBottomWidth: index === (order.history || []).length - 1 ? 0 : 1,
//               borderBottomColor: colors.border,
//             }}
//           >
//             <Text style={{ color: colors.grayText }}>{formatDate(entry.date)}</Text>
//             <StatusBadge status={entry.status} />
//             <Text style={{ color: "#0F172A", fontWeight: "700" }}>{entry.changedBy}</Text>
//             {entry.note ? <Text style={{ color: colors.grayText }}>{entry.note}</Text> : null}
//           </View>
//         ))}
//       </View>
//     </Card>
//   );
// }

// function CreateOrderModal({
//   visible,
//   onClose,
//   onCreated,
//   products,
//   providers,
// }: {
//   visible: boolean;
//   onClose: () => void;
//   onCreated: () => Promise<void>;
//   products: Product[];
//   providers: DeliveryProvider[];
// }) {
//   const [form, setForm] = useState<CreateFormState>(INITIAL_FORM);
//   const [draftProductId, setDraftProductId] = useState("");
//   const [draftQuantity, setDraftQuantity] = useState("1");
//   const [items, setItems] = useState<CreateOrderLine[]>([]);
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     if (!visible) {
//       setForm(INITIAL_FORM);
//       setDraftProductId("");
//       setDraftQuantity("1");
//       setItems([]);
//     }
//   }, [visible]);

//   const productOptions = useMemo(
//     () => [{ key: "", label: "Choisir un produit" }, ...products.map((product) => ({ key: product._id, label: product.name }))],
//     [products]
//   );
//   const deliveryOptions = useMemo(
//     () => [{ key: "", label: "Aucune societe" }, ...providers.map((provider) => ({ key: provider.name, label: provider.name }))],
//     [providers]
//   );
//   const selectedProduct = products.find((product) => product._id === draftProductId);
//   const quantityNumber = Math.max(1, Number(draftQuantity || 1));
//   const selectedProductImage = selectedProduct?.images?.[0]
//     ? selectedProduct.images[0].startsWith("http")
//       ? selectedProduct.images[0]
//       : `${API_URL}${selectedProduct.images[0]}`
//     : null;
//   const draftSubTotal = Number(selectedProduct?.price || 0) * quantityNumber;
//   const draftEstimatedTotal = draftSubTotal + Number(selectedProduct?.deliveryFee || 0);
//   const itemsSubTotal = items.reduce(
//     (sum, item) => sum + Number(item.unitPrice || 0) * Math.max(1, Number(item.quantity || 1)),
//     0
//   );
//   const itemsDeliveryTotal = items.reduce((sum, item) => sum + Number(item.deliveryFee || 0), 0);
//   const finalTotal = itemsSubTotal + itemsDeliveryTotal;

//   const setValue = (key: keyof CreateFormState, value: string | boolean) => {
//     setForm((current) => ({ ...current, [key]: value }));
//   };

//   const addSelectedProduct = () => {
//     if (!selectedProduct) return;

//     setItems((current) => [
//       ...current,
//       {
//         productId: selectedProduct._id,
//         name: selectedProduct.name,
//         image: selectedProductImage,
//         quantity: String(quantityNumber),
//         unitPrice: Number(selectedProduct.price || 0),
//         deliveryFee: Number(selectedProduct.deliveryFee || 0),
//       },
//     ]);
//     setDraftProductId("");
//     setDraftQuantity("1");
//   };

//   const updateItemQuantity = (targetIndex: number, quantity: string) => {
//     setItems((current) =>
//       current.map((item, index) =>
//         index === targetIndex
//           ? { ...item, quantity: quantity.replace(/[^0-9]/g, "") || "1" }
//           : item
//       )
//     );
//   };

//   const removeItem = (targetIndex: number) => {
//     setItems((current) => current.filter((_, index) => index !== targetIndex));
//   };

//   const submit = async () => {
//     if (!form.customerName.trim() || !form.phone.trim() || !items.length) return;
//     setSaving(true);
//     try {
//       await createOrder({
//         customerName: form.customerName.trim(),
//         phone: form.phone.trim(),
//         city: form.city || undefined,
//         address: form.address || undefined,
//         email: form.email || undefined,
//         customerNote: form.customerNote || undefined,
//         deliveryCompany: form.deliveryCompany || undefined,
//         exchange: form.exchange,
//         items: items.map((item) => ({
//           product: item.productId,
//           quantity: Math.max(1, Number(item.quantity || 1)),
//           price: Number(item.unitPrice || 0),
//           deliveryFee: Number(item.deliveryFee || 0),
//         })),
//       });
//       await onCreated();
//       onClose();
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
//       <View style={{ flex: 1, backgroundColor: "rgba(15,23,42,0.45)", justifyContent: "center", padding: 20 }}>
//         <Card style={{ maxWidth: 880, width: "100%", alignSelf: "center", maxHeight: "90%" }}>
//           <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
//             <Text style={{ fontSize: 24, fontWeight: "900", color: "#0F172A" }}>Ajouter une commande</Text>
//             <Pressable onPress={onClose}>
//               <Text style={{ color: colors.grayText, fontWeight: "900", fontSize: 20 }}>✕</Text>
//             </Pressable>
//           </View>

//           <ScrollView showsVerticalScrollIndicator={false}>
//             <View style={{ gap: 14 }}>
//               <View style={{ flexDirection: "row", gap: 12 }}>
//                 <View style={{ flex: 1 }}>
//                   <Text style={{ color: colors.grayText, fontWeight: "800", marginBottom: 8 }}>Nom client</Text>
//                   <Input value={form.customerName} onChangeText={(value) => setValue("customerName", value)} />
//                 </View>
//                 <View style={{ flex: 1 }}>
//                   <Text style={{ color: colors.grayText, fontWeight: "800", marginBottom: 8 }}>Telephone</Text>
//                   <Input value={form.phone} onChangeText={(value) => setValue("phone", value)} />
//                 </View>
//               </View>

//               <View style={{ flexDirection: "row", gap: 12 }}>
//                 <View style={{ flex: 1 }}>
//                   <Text style={{ color: colors.grayText, fontWeight: "800", marginBottom: 8 }}>Ville</Text>
//                   <FilterSelect
//                     value={form.city}
//                     title="Choisir une ville"
//                     options={[{ key: "", label: "Choisir une ville" }, ...TUNISIA_CITIES.map((city) => ({ key: city, label: city }))]}
//                     onChange={(value) => setValue("city", value)}
//                   />
//                 </View>
//                 <View style={{ flex: 1 }}>
//                   <Text style={{ color: colors.grayText, fontWeight: "800", marginBottom: 8 }}>Societe de livraison</Text>
//                   <FilterSelect
//                     value={form.deliveryCompany}
//                     title="Choisir une societe de livraison"
//                     options={deliveryOptions}
//                     onChange={(value) => setValue("deliveryCompany", value)}
//                   />
//                 </View>
//               </View>

//               <View>
//                 <Text style={{ color: colors.grayText, fontWeight: "800", marginBottom: 8 }}>Adresse</Text>
//                 <Input value={form.address} onChangeText={(value) => setValue("address", value)} />
//               </View>

//               <View style={{ flexDirection: "row", gap: 12 }}>
//                 <View style={{ flex: 1 }}>
//                   <Text style={{ color: colors.grayText, fontWeight: "800", marginBottom: 8 }}>Email</Text>
//                   <Input value={form.email} onChangeText={(value) => setValue("email", value)} autoCapitalize="none" />
//                 </View>
//                 <View style={{ flex: 1 }}>
//                   <Text style={{ color: colors.grayText, fontWeight: "800", marginBottom: 8 }}>Produit</Text>
//                   <FilterSelect
//                     value={draftProductId}
//                     title="Choisir un produit"
//                     options={productOptions}
//                     onChange={setDraftProductId}
//                   />
//                 </View>
//               </View>

//               <View style={{ flexDirection: "row", gap: 12 }}>
//                 <View style={{ flex: 1 }}>
//                   <Text style={{ color: colors.grayText, fontWeight: "800", marginBottom: 8 }}>Quantite</Text>
//                   <Input value={draftQuantity} onChangeText={(value) => setDraftQuantity(value.replace(/[^0-9]/g, "") || "1")} keyboardType="number-pad" />
//                 </View>
//                 <View style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14, justifyContent: "center", backgroundColor: "#F8FAFC" }}>
//                   <Text style={{ color: colors.grayText, fontWeight: "700" }}>Apercu selection</Text>
//                   <Text style={{ color: "#6D28D9", fontWeight: "900", fontSize: 22, marginTop: 6 }}>{formatMoney(draftEstimatedTotal)}</Text>
//                 </View>
//               </View>

//               {selectedProduct ? (
//                 <Card style={{ padding: 0, overflow: "hidden" }}>
//                   <View style={{ paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}>
//                     <Text style={{ color: "#0F172A", fontWeight: "900", fontSize: 18 }}>Resume de la commande</Text>
//                   </View>
//                   <View style={{ padding: 16, gap: 14 }}>
//                     <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
//                       <View
//                         style={{
//                           width: 62,
//                           height: 62,
//                           borderRadius: 14,
//                           borderWidth: 1,
//                           borderColor: colors.border,
//                           overflow: "hidden",
//                           alignItems: "center",
//                           justifyContent: "center",
//                           backgroundColor: "#F8FAFC",
//                         }}
//                       >
//                         {selectedProductImage ? (
//                           <Image source={{ uri: selectedProductImage }} style={{ width: 62, height: 62 }} />
//                         ) : (
//                           <Text style={{ color: colors.grayText, fontSize: 12 }}>IMG</Text>
//                         )}
//                       </View>
//                       <View style={{ flex: 1 }}>
//                         <Text style={{ color: "#0F172A", fontWeight: "900", fontSize: 16 }}>
//                           {selectedProduct.name}
//                         </Text>
//                         <Text style={{ color: colors.grayText, marginTop: 4 }}>
//                           Quantite: {quantityNumber}
//                         </Text>
//                       </View>
//                     </View>

//                     <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: "hidden" }}>
//                       <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12, backgroundColor: "#F8FAFC", borderBottomWidth: 1, borderBottomColor: colors.border }}>
//                         <Text style={{ color: "#0F172A", fontWeight: "800" }}>Prix unitaire</Text>
//                         <Text style={{ color: "#0F172A", fontWeight: "900" }}>{formatMoney(Number(selectedProduct.price || 0))}</Text>
//                       </View>
//                       <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
//                         <Text style={{ color: "#0F172A", fontWeight: "800" }}>Sous-total</Text>
//                         <Text style={{ color: "#0F172A", fontWeight: "900" }}>
//                           {formatMoney(draftSubTotal)}
//                         </Text>
//                       </View>
//                       <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
//                         <Text style={{ color: "#0F172A", fontWeight: "800" }}>Frais de livraison</Text>
//                         <Text style={{ color: "#0F172A", fontWeight: "900" }}>
//                           {formatMoney(Number(selectedProduct.deliveryFee || 0))}
//                         </Text>
//                       </View>
//                       <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 14, backgroundColor: "#EDE9FE" }}>
//                         <Text style={{ color: "#5B21B6", fontWeight: "900", fontSize: 16 }}>Total</Text>
//                         <Text style={{ color: "#0F172A", fontWeight: "900", fontSize: 18 }}>
//                           {formatMoney(draftEstimatedTotal)}
//                         </Text>
//                       </View>
//                     </View>
//                     <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
//                       <Button title="Ajouter au resume" onPress={addSelectedProduct} />
//                     </View>
//                   </View>
//                 </Card>
//               ) : null}

//               {items.length ? (
//                 <Card style={{ padding: 0, overflow: "hidden" }}>
//                   <View style={{ paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}>
//                     <Text style={{ color: "#0F172A", fontWeight: "900", fontSize: 18 }}>Resume des commandes</Text>
//                   </View>
//                   <View style={{ padding: 16, gap: 12 }}>
//                     {items.map((item, index) => (
//                       <View
//                         key={`${item.productId}-${index}`}
//                         style={{
//                           borderWidth: 1,
//                           borderColor: colors.border,
//                           borderRadius: 14,
//                           padding: 12,
//                           backgroundColor: "#FFFFFF",
//                           gap: 12,
//                         }}
//                       >
//                         <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
//                           <View
//                             style={{
//                               width: 56,
//                               height: 56,
//                               borderRadius: 14,
//                               borderWidth: 1,
//                               borderColor: colors.border,
//                               overflow: "hidden",
//                               alignItems: "center",
//                               justifyContent: "center",
//                               backgroundColor: "#F8FAFC",
//                             }}
//                           >
//                             {item.image ? (
//                               <Image source={{ uri: item.image }} style={{ width: 56, height: 56 }} />
//                             ) : (
//                               <Text style={{ color: colors.grayText, fontSize: 12 }}>IMG</Text>
//                             )}
//                           </View>
//                           <View style={{ flex: 1 }}>
//                             <Text style={{ color: "#0F172A", fontWeight: "900" }}>{item.name}</Text>
//                             <Text style={{ color: colors.grayText, marginTop: 4 }}>
//                               Prix unitaire: {formatMoney(item.unitPrice)}
//                             </Text>
//                           </View>
//                           <Pressable onPress={() => removeItem(index)}>
//                             <Text style={{ color: "#DC2626", fontWeight: "900", fontSize: 18 }}>🗑</Text>
//                           </Pressable>
//                         </View>

//                         <View style={{ flexDirection: "row", gap: 12 }}>
//                           <View style={{ flex: 1 }}>
//                             <Text style={{ color: colors.grayText, fontWeight: "800", marginBottom: 8 }}>Quantite</Text>
//                             <Input
//                               value={item.quantity}
//                               onChangeText={(value) => updateItemQuantity(index, value)}
//                               keyboardType="number-pad"
//                             />
//                           </View>
//                           <View style={{ flex: 1, justifyContent: "center", borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14, backgroundColor: "#F8FAFC" }}>
//                             <Text style={{ color: colors.grayText, fontWeight: "700" }}>Frais livraison</Text>
//                             <Text style={{ color: "#0F172A", fontWeight: "900", fontSize: 18, marginTop: 6 }}>
//                               {formatMoney(item.deliveryFee)}
//                             </Text>
//                           </View>
//                         </View>
//                       </View>
//                     ))}

//                     <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: "hidden" }}>
//                       <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
//                         <Text style={{ color: "#0F172A", fontWeight: "800" }}>Sous-total produits</Text>
//                         <Text style={{ color: "#0F172A", fontWeight: "900" }}>{formatMoney(itemsSubTotal)}</Text>
//                       </View>
//                       <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
//                         <Text style={{ color: "#0F172A", fontWeight: "800" }}>Frais de livraison</Text>
//                         <Text style={{ color: "#0F172A", fontWeight: "900" }}>{formatMoney(itemsDeliveryTotal)}</Text>
//                       </View>
//                       <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 14, backgroundColor: "#EDE9FE" }}>
//                         <Text style={{ color: "#5B21B6", fontWeight: "900", fontSize: 16 }}>Total final</Text>
//                         <Text style={{ color: "#0F172A", fontWeight: "900", fontSize: 18 }}>{formatMoney(finalTotal)}</Text>
//                       </View>
//                     </View>
//                   </View>
//                 </Card>
//               ) : null}

//               <View>
//                 <Text style={{ color: colors.grayText, fontWeight: "800", marginBottom: 8 }}>Note client</Text>
//                 <Input value={form.customerNote} onChangeText={(value) => setValue("customerNote", value)} multiline style={{ minHeight: 90, textAlignVertical: "top" as any }} />
//               </View>

//               <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 }}>
//                 <Text style={{ color: "#0F172A", fontWeight: "800" }}>Commande echange</Text>
//                 <Switch value={form.exchange} onValueChange={(value) => setValue("exchange", value)} />
//               </View>
//             </View>
//           </ScrollView>

//           <View style={{ flexDirection: "row", gap: 12, marginTop: 18 }}>
//             <View style={{ flex: 1 }}>
//               <Button title="Annuler" variant="ghost" onPress={onClose} />
//             </View>
//             <View style={{ flex: 1 }}>
//               <Button title={saving ? "Enregistrement..." : "Ajouter la commande"} onPress={submit} disabled={saving} />
//             </View>
//           </View>
//         </Card>
//       </View>
//     </Modal>
//   );
// }

// export default function OrdersListScreen() {
//   const router = useRouter();
//   const { width } = useWindowDimensions();
//   const isDesktop = width >= 1180;

//   const [orders, setOrders] = useState<Order[]>([]);
//   const [products, setProducts] = useState<Product[]>([]);
//   const [providers, setProviders] = useState<DeliveryProvider[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [query, setQuery] = useState("");
//   const [activeTab, setActiveTab] = useState<OrdersTab>("commandes");
//   const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
//   const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
//   const [productFilter, setProductFilter] = useState<string>("all");
//   const [cityFilter, setCityFilter] = useState<string>("all");
//   const [deliveryFilter, setDeliveryFilter] = useState<string>("all");
//   const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [historyOrderId, setHistoryOrderId] = useState<string | null>(null);
//   const [page, setPage] = useState(1);
//   const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
//   const hasBootstrappedAlertRef = useRef(false);
//   const knownOrderIdsRef = useRef<string[]>([]);
//   const pageSize = 8;

//   const loadOrders = async (silent = false) => {
//     if (!silent) setLoading(true);
//     try {
//       const data = await getOrders();
//       const nextIds = data.map((order) => order._id);
//       const hasNewOrder =
//         hasBootstrappedAlertRef.current &&
//         nextIds.some((id) => !knownOrderIdsRef.current.includes(id));

//       knownOrderIdsRef.current = nextIds;
//       hasBootstrappedAlertRef.current = true;
//       setOrders(data);

//       if (hasNewOrder) {
//         await playNewOrderAlert();
//       }
//     } catch (error) {
//       if ((error as { response?: { status?: number } })?.response?.status === 401) {
//         await logout();
//         router.replace("/login");
//         return;
//       }
//       throw error;
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const loadLookups = async () => {
//     const [productsList, enabledProviders] = await Promise.all([
//       getProducts(),
//       getEnabledDeliveryProviders(),
//     ]);

//     setProducts(productsList);
//     setProviders(enabledProviders.map((item) => item.provider));
//   };

//   useEffect(() => {
//     loadOrders();
//     loadLookups().catch(console.error);
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       loadOrders(true);
//     }, 15000);

//     return () => clearInterval(interval);
//   }, []);

//   const productOptions = useMemo(
//     () => [{ key: "all", label: "Produit" }, ...products.map((product) => ({ key: product._id, label: product.name }))],
//     [products]
//   );
//   const deliveryOptions = useMemo(
//     () => [{ key: "all", label: "Livraison" }, ...providers.map((provider) => ({ key: provider.name, label: provider.name }))],
//     [providers]
//   );
//   const cityOptions = useMemo(
//     () => [{ key: "all", label: "Ville" }, ...TUNISIA_CITIES.map((city) => ({ key: city, label: city }))],
//     []
//   );

//   const counts = useMemo(() => {
//     const total = orders.filter((order) => !order.isDeleted && !order.isArchived && !order.isAbandoned).length;
//     const abandoned = orders.filter(
//       (order) =>
//         !order.isDeleted &&
//         !order.isArchived &&
//         !!order.isAbandoned
//     ).length;
//     const deleted = orders.filter((order) => order.isDeleted).length;
//     const archived = orders.filter((order) => order.isArchived && !order.isDeleted).length;
//     return { total, abandoned, deleted, archived };
//   }, [orders]);

//   const filteredOrders = useMemo(() => {
//     const search = query.trim().toLowerCase();
//     return orders.filter((order) => {
//       const matchesTab =
//         activeTab === "commandes"
//           ? !order.isDeleted && !order.isArchived && !order.isAbandoned
//           : activeTab === "abandonnee"
//             ? !order.isDeleted && !order.isArchived && !!order.isAbandoned
//             : activeTab === "supprimee"
//               ? !!order.isDeleted
//               : !!order.isArchived && !order.isDeleted;
//       const firstProduct = order.items[0];
//       const productTitle = firstProduct ? getProductTitle(firstProduct).toLowerCase() : "";
//       const productId =
//         typeof firstProduct?.product === "string" ? firstProduct.product : firstProduct?.product?._id || "";

//       const matchesSearch =
//         !search ||
//         order.customerName.toLowerCase().includes(search) ||
//         order.phone.toLowerCase().includes(search) ||
//         productTitle.includes(search) ||
//         order._id.toLowerCase().includes(search);

//       const matchesStatus = statusFilter === "all" || order.status === statusFilter;
//       const matchesPeriodValue = matchesPeriod(order.createdAt, periodFilter);
//       const matchesProduct =
//         productFilter === "all" ||
//         String(productId).toLowerCase() === productFilter.toLowerCase();
//       const matchesCity =
//         cityFilter === "all" ||
//         String(order.city || "").trim().toLowerCase() === cityFilter.toLowerCase();
//       const matchesDelivery =
//         deliveryFilter === "all" ||
//         String(order.deliveryCompany || "").trim().toLowerCase() === deliveryFilter.toLowerCase();

//       return matchesTab && matchesSearch && matchesStatus && matchesPeriodValue && matchesProduct && matchesCity && matchesDelivery;
//     });
//   }, [activeTab, cityFilter, deliveryFilter, orders, periodFilter, productFilter, query, statusFilter]);

//   const totalRevenue = useMemo(
//     () => filteredOrders.reduce((sum, order) => sum + Number(order.total || 0), 0),
//     [filteredOrders]
//   );

//   const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
//   const pagedOrders = useMemo(
//     () => filteredOrders.slice((page - 1) * pageSize, page * pageSize),
//     [filteredOrders, page]
//   );

//   const historyOrder = filteredOrders.find((order) => order._id === historyOrderId) || null;

//   useEffect(() => {
//     setPage(1);
//   }, [activeTab, query, statusFilter, periodFilter, productFilter, cityFilter, deliveryFilter]);

//   useEffect(() => {
//     setSelectedOrderIds((current) => current.filter((id) => filteredOrders.some((order) => order._id === id)));
//   }, [filteredOrders]);

//   const allPageSelected =
//     pagedOrders.length > 0 && pagedOrders.every((order) => selectedOrderIds.includes(order._id));

//   const toggleSelectOrder = (orderId: string) => {
//     setSelectedOrderIds((current) =>
//       current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId]
//     );
//   };

//   const toggleSelectCurrentPage = () => {
//     setSelectedOrderIds((current) => {
//       if (allPageSelected) {
//         return current.filter((id) => !pagedOrders.some((order) => order._id === id));
//       }
//       const next = [...current];
//       pagedOrders.forEach((order) => {
//         if (!next.includes(order._id)) next.push(order._id);
//       });
//       return next;
//     });
//   };

//   const performBulkAction = async (action: "archive" | "delete" | "restore") => {
//     const targets = [...selectedOrderIds];
//     if (!targets.length) return;

//     if (action === "archive") {
//       await Promise.all(targets.map((id) => archiveOrder(id)));
//     } else if (action === "delete") {
//       await Promise.all(targets.map((id) => deleteOrder(id)));
//     } else {
//       await Promise.all(targets.map((id) => restoreOrder(id)));
//     }

//     setSelectedOrderIds([]);
//     await loadOrders(true);
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: colors.bg }}>
//       <CreateOrderModal
//         visible={showCreateModal}
//         onClose={() => setShowCreateModal(false)}
//         onCreated={async () => {
//           await loadOrders(true);
//         }}
//         products={products}
//         providers={providers}
//       />

//       <ScrollView
//         contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={() => {
//               setRefreshing(true);
//               loadOrders(true);
//             }}
//           />
//         }
//       >
//         <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
//             {[
//               { key: "commandes", label: "Commandes", count: counts.total },
//               { key: "abandonnee", label: "Abandonnee", count: counts.abandoned },
//               { key: "supprimee", label: "Supprimee", count: counts.deleted },
//               { key: "archivee", label: "Archivee", count: counts.archived },
//             ].map((tab) => (
//               <Pressable
//                 key={tab.key}
//                 onPress={() => setActiveTab(tab.key as OrdersTab)}
//                 style={{
//                   backgroundColor: activeTab === tab.key ? "white" : "#E2E8F0",
//                   borderRadius: 14,
//                   borderWidth: 1,
//                   borderColor: activeTab === tab.key ? colors.border : "transparent",
//                   paddingHorizontal: 18,
//                   paddingVertical: 12,
//                   flexDirection: "row",
//                   alignItems: "center",
//                   gap: 8,
//                 }}
//               >
//                 <Text style={{ color: activeTab === tab.key ? "#0F172A" : "#64748B", fontWeight: "800" }}>
//                   {tab.label}
//                 </Text>
//                 {tab.count > 0 ? (
//                   <View
//                     style={{
//                       minWidth: 24,
//                       height: 24,
//                       borderRadius: 999,
//                       backgroundColor: activeTab === tab.key ? "#E2E8F0" : "#CBD5E1",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       paddingHorizontal: 6,
//                     }}
//                   >
//                     <Text style={{ color: colors.blue, fontWeight: "800", fontSize: 12 }}>{tab.count}</Text>
//                   </View>
//                 ) : null}
//               </Pressable>
//             ))}
//           </ScrollView>

//           <View style={{ flexDirection: "row", gap: 10 }}>
//             <Pressable
//               onPress={() => setShowCreateModal(true)}
//               style={{
//                 width: 54,
//                 height: 54,
//                 borderRadius: 14,
//                 backgroundColor: "#6D28D9",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <Text style={{ color: "white", fontSize: 22, fontWeight: "900" }}>⌘</Text>
//             </Pressable>
//             <Pressable
//               onPress={() => setShowCreateModal(true)}
//               style={{
//                 borderRadius: 14,
//                 backgroundColor: "#6D28D9",
//                 paddingHorizontal: 20,
//                 alignItems: "center",
//                 justifyContent: "center",
//                 minHeight: 54,
//               }}
//             >
//               <Text style={{ color: "white", fontSize: 20, fontWeight: "900" }}>Ajouter une commande +</Text>
//             </Pressable>
//           </View>
//         </View>

//         {selectedOrderIds.length > 0 ? (
//           <Card style={{ padding: 12 }}>
//             <View style={{ flexDirection: isDesktop ? "row" : "column", alignItems: isDesktop ? "center" : "stretch", justifyContent: "space-between", gap: 12 }}>
//               <Text style={{ color: "#0F172A", fontWeight: "800" }}>
//                 {selectedOrderIds.length} commande(s) selectionnee(s)
//               </Text>
//               <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
//                 {activeTab !== "archivee" ? (
//                   <Pressable
//                     onPress={() => performBulkAction("archive")}
//                     style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: "#EDE9FE", borderWidth: 1, borderColor: "#DDD6FE" }}
//                   >
//                     <Text style={{ color: "#6D28D9", fontWeight: "900" }}>Archiver</Text>
//                   </Pressable>
//                 ) : null}
//                 {activeTab === "archivee" || activeTab === "supprimee" ? (
//                   <Pressable
//                     onPress={() => performBulkAction("restore")}
//                     style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: "#DCFCE7", borderWidth: 1, borderColor: "#BBF7D0" }}
//                   >
//                     <Text style={{ color: "#166534", fontWeight: "900" }}>Restaurer</Text>
//                   </Pressable>
//                 ) : null}
//                 {activeTab !== "supprimee" ? (
//                   <Pressable
//                     onPress={() => performBulkAction("delete")}
//                     style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: "#FEE2E2", borderWidth: 1, borderColor: "#FECACA" }}
//                   >
//                     <Text style={{ color: "#B91C1C", fontWeight: "900" }}>Supprimer</Text>
//                   </Pressable>
//                 ) : null}
//               </View>
//             </View>
//           </Card>
//         ) : null}

//         <Card style={{ padding: 14 }}>
//           <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 12, alignItems: isDesktop ? "center" : "stretch" }}>
//             <View style={{ flex: 1.2 }}>
//               <View
//                 style={{
//                   minHeight: 54,
//                   borderRadius: 14,
//                   borderWidth: 1,
//                   borderColor: colors.border,
//                   backgroundColor: "white",
//                   paddingHorizontal: 14,
//                   flexDirection: "row",
//                   alignItems: "center",
//                   gap: 10,
//                 }}
//               >
//                 <Text style={{ color: "#94A3B8", fontSize: 18 }}>⌕</Text>
//                 <Input
//                   value={query}
//                   onChangeText={setQuery}
//                   placeholder="Rechercher..."
//                   style={{
//                     flex: 1,
//                     borderWidth: 0,
//                     paddingHorizontal: 0,
//                     paddingVertical: 0,
//                     minHeight: 0,
//                   }}
//                 />
//               </View>
//             </View>
//             <FilterSelect
//               value={statusFilter}
//               options={STATUS_OPTIONS}
//               onChange={setStatusFilter}
//               renderSelected={(option) => {
//                 if (option.key === "all") {
//                   return <Text style={{ color: "#64748B", fontWeight: "700" }}>{option.label}</Text>;
//                 }
//                 const theme = getStatusTheme(option.key);
//                 return (
//                   <View style={{ alignSelf: "flex-start", backgroundColor: theme.bg, borderColor: theme.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
//                     <Text style={{ color: theme.text, fontWeight: "800" }}>{option.label}</Text>
//                   </View>
//                 );
//               }}
//             />
//             <FilterSelect value={periodFilter} options={PERIOD_OPTIONS} onChange={setPeriodFilter} />
//             <Pressable
//               onPress={() => setShowAdvancedFilters((current) => !current)}
//               style={{
//                 minHeight: 54,
//                 borderRadius: 14,
//                 borderWidth: 1,
//                 borderColor: colors.border,
//                 paddingHorizontal: 18,
//                 alignItems: "center",
//                 justifyContent: "center",
//                 backgroundColor: "white",
//               }}
//             >
//               <Text style={{ color: "#0F172A", fontWeight: "900" }}>Filtre avance {showAdvancedFilters ? "−" : "+"}</Text>
//             </Pressable>
//             <View style={{ minHeight: 54, borderRadius: 14, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, backgroundColor: "white", flexDirection: "row", alignItems: "center", gap: 10 }}>
//               <Switch value />
//               <Text style={{ color: "#0F172A", fontWeight: "800" }}>Toutes les commandes</Text>
//             </View>
//           </View>

//           {showAdvancedFilters ? (
//             <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 12, marginTop: 14 }}>
//               <FilterSelect value={productFilter} options={productOptions} onChange={setProductFilter} />
//               <FilterSelect value={cityFilter} options={cityOptions} onChange={setCityFilter} />
//               <FilterSelect value={deliveryFilter} options={deliveryOptions} onChange={setDeliveryFilter} />
//             </View>
//           ) : null}
//         </Card>

//         <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 12 }}>
//           <Card style={{ flex: 1 }}>
//             <Text style={{ color: colors.grayText, fontWeight: "700" }}>Total commandes</Text>
//             <Text style={{ color: colors.blue, fontSize: 30, fontWeight: "900", marginTop: 8 }}>{filteredOrders.length}</Text>
//           </Card>
//           <Card style={{ flex: 1 }}>
//             <Text style={{ color: colors.grayText, fontWeight: "700" }}>Valeur totale</Text>
//             <Text style={{ color: colors.orange, fontSize: 30, fontWeight: "900", marginTop: 8 }}>{formatMoney(totalRevenue)}</Text>
//           </Card>
//         </View>

//         {loading ? (
//           <View style={{ paddingVertical: 36 }}>
//             <ActivityIndicator />
//           </View>
//         ) : (
//           <View style={{ flexDirection: isDesktop ? "row" : "column", alignItems: "flex-start", gap: 16 }}>
//             <Card style={{ flex: 1, padding: 0, overflow: "hidden" }}>
//               <View style={{ paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: "#F8FAFC" }}>
//                 <View style={{ flexDirection: "row", alignItems: "center" }}>
//                   <Pressable
//                     onPress={toggleSelectCurrentPage}
//                     style={{
//                       width: 24,
//                       height: 24,
//                       borderRadius: 6,
//                       borderWidth: 1,
//                       borderColor: allPageSelected ? colors.blue : "#CBD5E1",
//                       backgroundColor: allPageSelected ? colors.blue : "white",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       marginRight: 12,
//                     }}
//                   >
//                     <Text style={{ color: allPageSelected ? "white" : "#94A3B8", fontWeight: "900" }}>✓</Text>
//                   </Pressable>
//                   <Text style={{ width: 80, fontWeight: "900", color: colors.blue }}>ID</Text>
//                   <Text style={{ flex: 1.7, fontWeight: "900", color: colors.blue }}>Produits</Text>
//                   <Text style={{ flex: 1.2, fontWeight: "900", color: colors.blue }}>Client</Text>
//                   <Text style={{ flex: 1.5, fontWeight: "900", color: colors.blue }}>Date</Text>
//                   <Text style={{ flex: 1.2, fontWeight: "900", color: colors.blue }}>Livraison</Text>
//                   <Text style={{ flex: 1.2, fontWeight: "900", color: colors.blue }}>Statut</Text>
//                   <Text style={{ width: 110, fontWeight: "900", color: colors.blue, textAlign: "right" }}>Total</Text>
//                   <Text style={{ width: 110, fontWeight: "900", color: colors.blue, textAlign: "right" }}>Actions</Text>
//                 </View>
//               </View>

//               {pagedOrders.map((order, index) => {
//                 const firstItem = order.items[0];
//                 const imageUri = firstItem ? getProductImage(firstItem) : null;
//                 const showHistory = order.status !== "en_attente";

//                 return (
//                   <View
//                     key={order._id}
//                     style={{
//                       paddingHorizontal: 14,
//                       paddingVertical: 14,
//                       borderBottomWidth: index === pagedOrders.length - 1 ? 0 : 1,
//                       borderBottomColor: colors.border,
//                       backgroundColor: historyOrderId === order._id ? "#FCFAFF" : "white",
//                     }}
//                   >
//                     <View style={{ flexDirection: "row", alignItems: "center" }}>
//                       <Pressable
//                         onPress={() => toggleSelectOrder(order._id)}
//                         style={{
//                           width: 24,
//                           height: 24,
//                           borderRadius: 6,
//                           borderWidth: 1,
//                           borderColor: selectedOrderIds.includes(order._id) ? colors.blue : "#CBD5E1",
//                           backgroundColor: selectedOrderIds.includes(order._id) ? colors.blue : "white",
//                           alignItems: "center",
//                           justifyContent: "center",
//                           marginRight: 12,
//                         }}
//                       >
//                         <Text style={{ color: selectedOrderIds.includes(order._id) ? "white" : "#94A3B8", fontWeight: "900" }}>✓</Text>
//                       </Pressable>
//                       <Text style={{ width: 80, color: "#0F172A", fontWeight: "700" }}>{order._id.slice(-4)}</Text>
//                       <View style={{ flex: 1.7, flexDirection: "row", alignItems: "center", gap: 10 }}>
//                         <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: "#F8FAFC", overflow: "hidden", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border }}>
//                           {imageUri ? <Image source={{ uri: imageUri }} style={{ width: 42, height: 42 }} /> : <Text style={{ color: colors.grayText, fontSize: 11 }}>IMG</Text>}
//                         </View>
//                         <View style={{ flex: 1 }}>
//                           <Text style={{ color: "#0F172A", fontWeight: "800" }}>{firstItem ? getProductTitle(firstItem) : "Produit"}</Text>
//                           <Text style={{ color: colors.grayText, marginTop: 3 }}>x{firstItem?.quantity || 0}</Text>
//                         </View>
//                       </View>
//                       <View style={{ flex: 1.2 }}>
//                         <Text style={{ color: "#0F172A", fontWeight: "800" }}>{order.customerName}</Text>
//                         <Text style={{ color: colors.grayText, marginTop: 3 }}>{order.phone}</Text>
//                       </View>
//                       <Text style={{ flex: 1.5, color: colors.grayText }}>{formatDate(order.createdAt)}</Text>
//                       <View style={{ flex: 1.2 }}>
//                         <Text style={{ color: "#0F172A", fontWeight: "700" }}>{order.deliveryCompany || "-"}</Text>
//                       </View>
//                       <View style={{ flex: 1.2 }}>
//                         <StatusBadge
//                           status={order.status}
//                           onPress={showHistory ? () => setHistoryOrderId((current) => (current === order._id ? null : order._id)) : undefined}
//                         />
//                       </View>
//                       <Text style={{ width: 110, color: colors.blue, fontWeight: "900", textAlign: "right" }}>{formatMoney(order.total)}</Text>
//                       <View style={{ width: 110, flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
//                         <Pressable onPress={() => router.push(`/orders/${order._id}` as never)}>
//                           <Text style={{ color: colors.blue, fontWeight: "900" }}>◉</Text>
//                         </Pressable>
//                         <Pressable onPress={() => router.push(`/orders/${order._id}` as never)}>
//                           <Text style={{ color: "#475569", fontWeight: "900" }}>✎</Text>
//                         </Pressable>
//                         {activeTab === "archivee" || activeTab === "supprimee" ? (
//                           <Pressable onPress={() => restoreOrder(order._id).then(() => loadOrders(true))}>
//                             <Text style={{ color: "#166534", fontWeight: "900" }}>↺</Text>
//                           </Pressable>
//                         ) : (
//                           <>
//                             <Pressable onPress={() => archiveOrder(order._id).then(() => loadOrders(true))}>
//                               <Text style={{ color: "#6D28D9", fontWeight: "900" }}>⌂</Text>
//                             </Pressable>
//                             <Pressable onPress={() => deleteOrder(order._id).then(() => loadOrders(true))}>
//                               <Text style={{ color: "#B91C1C", fontWeight: "900" }}>🗑</Text>
//                             </Pressable>
//                           </>
//                         )}
//                       </View>
//                     </View>
//                   </View>
//                 );
//               })}

//               <View
//                 style={{
//                   borderTopWidth: 1,
//                   borderTopColor: colors.border,
//                   paddingHorizontal: 14,
//                   paddingVertical: 14,
//                   flexDirection: "row",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                 }}
//               >
//                 <Text style={{ color: colors.grayText, fontWeight: "700" }}>
//                   Lignes par page: {pageSize}
//                 </Text>
//                 <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
//                   <Text style={{ color: colors.grayText, fontWeight: "700" }}>
//                     Page {page} / {pageCount}
//                   </Text>
//                   <Pressable
//                     onPress={() => setPage((current) => Math.max(1, current - 1))}
//                     style={{
//                       width: 42,
//                       height: 42,
//                       borderRadius: 12,
//                       borderWidth: 1,
//                       borderColor: colors.border,
//                       alignItems: "center",
//                       justifyContent: "center",
//                       backgroundColor: page === 1 ? "#F8FAFC" : "white",
//                     }}
//                   >
//                     <Text style={{ color: page === 1 ? "#94A3B8" : "#0F172A", fontWeight: "900" }}>←</Text>
//                   </Pressable>
//                   <Pressable
//                     onPress={() => setPage((current) => Math.min(pageCount, current + 1))}
//                     style={{
//                       width: 42,
//                       height: 42,
//                       borderRadius: 12,
//                       borderWidth: 1,
//                       borderColor: colors.border,
//                       alignItems: "center",
//                       justifyContent: "center",
//                       backgroundColor: page === pageCount ? "#F8FAFC" : "white",
//                     }}
//                   >
//                     <Text style={{ color: page === pageCount ? "#94A3B8" : "#0F172A", fontWeight: "900" }}>→</Text>
//                   </Pressable>
//                 </View>
//               </View>
//             </Card>

//             {isDesktop ? <HistoryPopover order={historyOrder} /> : null}
//           </View>
//         )}
//       </ScrollView>
//     </View>
//   );
// }
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Switch,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Badge, Button, Card, Input, SectionTitle } from "../../src/ui/atoms";
import { colors } from "../../src/ui/theme";
import {
  archiveOrder,
  createOrder,
  deleteOrder,
  getOrders,
  restoreOrder,
} from "../../src/services/orders.service";
import { getProducts } from "../../src/services/products.service";
import { getEnabledDeliveryProviders } from "../../src/services/delivery-integrations.service";
import { playNewOrderAlert } from "../../src/services/order-alert.service";
import { logout } from "../../src/services/auth.service";
import type { Order, OrderItem, OrderStatus } from "../../src/types/order";
import type { Product } from "../../src/types/product";
import type { DeliveryProvider } from "../../src/types/delivery";

const API_URL = "http://127.0.0.1:3000";

const TUNISIA_CITIES = [
  "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Zaghouan", "Bizerte", "Beja",
  "Jendouba", "Kef", "Siliana", "Sousse", "Monastir", "Mahdia", "Sfax", "Kairouan",
  "Kasserine", "Sidi Bouzid", "Gabes", "Medenine", "Tataouine", "Gafsa", "Tozeur", "Kebili",
];

const PERIOD_OPTIONS = [
  { key: "all", label: "Choisissez une periode" },
  { key: "today", label: "Aujourd'hui" },
  { key: "7d", label: "7 derniers jours" },
  { key: "30d", label: "30 derniers jours" },
  { key: "month", label: "Ce mois" },
] as const;

type PeriodFilter = (typeof PERIOD_OPTIONS)[number]["key"];

const STATUS_OPTIONS: { key: "all" | OrderStatus; label: string }[] = [
  { key: "all", label: "Statut" },
  { key: "en_attente", label: "En attente" },
  { key: "confirmee", label: "Confirmee" },
  { key: "tentative1", label: "Tentative 1" },
  { key: "emballee", label: "Emballee" },
  { key: "livree", label: "Livree" },
  { key: "rejetee", label: "Rejetee" },
  { key: "retournee", label: "Retournee" },
];

type FilterSelectOption<T extends string> = { key: T; label: string };

type CreateFormState = {
  customerName: string;
  phone: string;
  city: string;
  address: string;
  email: string;
  customerNote: string;
  deliveryCompany: string;
  exchange: boolean;
};

type CreateOrderLine = {
  productId: string;
  name: string;
  image?: string | null;
  quantity: string;
  unitPrice: number;
  deliveryFee: number;
};

type OrdersTab = "commandes" | "abandonnee" | "supprimee" | "archivee";

const INITIAL_FORM: CreateFormState = {
  customerName: "",
  phone: "",
  city: "",
  address: "",
  email: "",
  customerNote: "",
  deliveryCompany: "",
  exchange: false,
};

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function formatMoney(value: number) {
  return `${Number(value || 0).toFixed(2)} DT`;
}

function matchesPeriod(value: string | undefined, period: PeriodFilter) {
  if (period === "all") return true;
  if (!value) return false;
  const orderDate = new Date(value);
  const now = new Date();
  if (period === "today") return orderDate.toDateString() === now.toDateString();
  if (period === "month") {
    return orderDate.getFullYear() === now.getFullYear() && orderDate.getMonth() === now.getMonth();
  }
  const diff = now.getTime() - orderDate.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  if (period === "7d") return days <= 7;
  if (period === "30d") return days <= 30;
  return true;
}

function getStatusTheme(status: OrderStatus) {
  switch (status) {
    case "confirmee":
      return { bg: "#DCFCE7", text: "#166534", border: "#BBF7D0" };
    case "livree":
      return { bg: "#DBEAFE", text: "#1D4ED8", border: "#BFDBFE" };
    case "emballee":
      return { bg: "#EDE9FE", text: "#6D28D9", border: "#DDD6FE" };
    case "tentative1":
      return { bg: "#FFEDD5", text: "#C2410C", border: "#FED7AA" };
    case "rejetee":
    case "retournee":
      return { bg: "#FEE2E2", text: "#B91C1C", border: "#FECACA" };
    default:
      return { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" };
  }
}

function getProductTitle(item: OrderItem) {
  if (typeof item.product === "string") return item.product;
  return item.product?.name || item.product?.title || item.product?._id || "Produit";
}

function getProductImage(item: OrderItem) {
  if (typeof item.product === "string") return null;
  const path = item.product?.images?.[0] || item.product?.image;
  if (!path) return null;
  return path.startsWith("http") ? path : `${API_URL}${path}`;
}

function StatusBadge({ status, onPress }: { status: OrderStatus; onPress?: () => void }) {
  const theme = getStatusTheme(status);
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: theme.bg,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: theme.border,
        paddingHorizontal: 12,
        paddingVertical: 7,
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ color: theme.text, fontWeight: "900", fontSize: 12 }}>{status}</Text>
    </Pressable>
  );
}

function FilterSelect<T extends string>({
  value,
  options,
  onChange,
  title,
  renderSelected,
  renderOption,
}: {
  value: T;
  options: readonly FilterSelectOption<T>[];
  onChange: (value: T) => void;
  title?: string;
  renderSelected?: (option: FilterSelectOption<T>) => React.ReactNode;
  renderOption?: (option: FilterSelectOption<T>, active: boolean) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((item) => item.key === value) || options[0];

  return (
    <View style={{ minWidth: 180 }}>
      <Pressable
        onPress={() => setOpen((current) => !current)}
        style={{
          minHeight: 54,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: "white",
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1 }}>
          {renderSelected ? (
            renderSelected(selected)
          ) : (
            <Text style={{ color: selected.key === options[0]?.key ? "#94A3B8" : "#0F172A", fontWeight: "700" }}>
              {selected.label}
            </Text>
          )}
        </View>
        <Text style={{ color: "#64748B", fontWeight: "900", marginLeft: 10 }}>⌄</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(15,23,42,0.22)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 460,
              alignSelf: "center",
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: "white",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#0F172A", fontWeight: "900", fontSize: 18 }}>
                {title || "Selection"}
              </Text>
              <Pressable onPress={() => setOpen(false)}>
                <Text style={{ color: colors.grayText, fontWeight: "900", fontSize: 18 }}>✕</Text>
              </Pressable>
            </View>

            <ScrollView nestedScrollEnabled style={{ maxHeight: 320 }}>
              <View style={{ padding: 10, gap: 8 }}>
                {options.map((option) => {
                  const active = option.key === value;
                  return (
                    <Pressable
                      key={option.key}
                      onPress={() => {
                        onChange(option.key);
                        setOpen(false);
                      }}
                      style={{
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: active ? colors.blue : colors.border,
                        backgroundColor: active ? "#EFF6FF" : "white",
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                      }}
                    >
                      {renderOption ? (
                        renderOption(option, active)
                      ) : (
                        <Text style={{ color: active ? colors.blue : "#334155", fontWeight: "700" }}>
                          {option.label}
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function HistoryPopover({ order }: { order: Order | null }) {
  if (!order) return null;

  return (
    <Card style={{ minWidth: 270, maxWidth: 320, borderStyle: "dashed", borderColor: "#A855F7" }}>
      <Text style={{ color: "#0F172A", fontWeight: "900", fontSize: 16 }}>{order.customerName}</Text>
      <View style={{ marginTop: 12, gap: 12 }}>
        {(order.history || []).map((entry, index) => (
          <View
            key={`${entry.status}-${entry.date}-${index}`}
            style={{
              gap: 6,
              paddingBottom: 10,
              borderBottomWidth: index === (order.history || []).length - 1 ? 0 : 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text style={{ color: colors.grayText }}>{formatDate(entry.date)}</Text>
            <StatusBadge status={entry.status} />
            <Text style={{ color: "#0F172A", fontWeight: "700" }}>{entry.changedBy}</Text>
            {entry.note ? <Text style={{ color: colors.grayText }}>{entry.note}</Text> : null}
          </View>
        ))}
      </View>
    </Card>
  );
}

function CreateOrderModal({
  visible,
  onClose,
  onCreated,
  products,
  providers,
}: {
  visible: boolean;
  onClose: () => void;
  onCreated: () => Promise<void>;
  products: Product[];
  providers: DeliveryProvider[];
}) {
  const [form, setForm] = useState<CreateFormState>(INITIAL_FORM);
  const [draftProductId, setDraftProductId] = useState("");
  const [draftQuantity, setDraftQuantity] = useState("1");
  const [items, setItems] = useState<CreateOrderLine[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) {
      setForm(INITIAL_FORM);
      setDraftProductId("");
      setDraftQuantity("1");
      setItems([]);
    }
  }, [visible]);

  const productOptions = useMemo(
    () => [{ key: "", label: "Choisir un produit" }, ...products.map((product) => ({ key: product._id, label: product.name }))],
    [products]
  );
  const deliveryOptions = useMemo(
    () => [{ key: "", label: "Aucune societe" }, ...providers.map((provider) => ({ key: provider.name, label: provider.name }))],
    [providers]
  );
  const selectedProduct = products.find((product) => product._id === draftProductId);
  const quantityNumber = Math.max(1, Number(draftQuantity || 1));
  const selectedProductImage = selectedProduct?.images?.[0]
    ? selectedProduct.images[0].startsWith("http")
      ? selectedProduct.images[0]
      : `${API_URL}${selectedProduct.images[0]}`
    : null;
  const draftSubTotal = Number(selectedProduct?.price || 0) * quantityNumber;
  const draftEstimatedTotal = draftSubTotal + Number(selectedProduct?.deliveryFee || 0);
  const itemsSubTotal = items.reduce(
    (sum, item) => sum + Number(item.unitPrice || 0) * Math.max(1, Number(item.quantity || 1)),
    0
  );
  const itemsDeliveryTotal = items.reduce((sum, item) => sum + Number(item.deliveryFee || 0), 0);
  const finalTotal = itemsSubTotal + itemsDeliveryTotal;

  const setValue = (key: keyof CreateFormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const addSelectedProduct = () => {
    if (!selectedProduct) return;

    setItems((current) => {
      const existingIndex = current.findIndex((item) => item.productId === selectedProduct._id);
      if (existingIndex >= 0) {
        return current.map((item, index) =>
          index === existingIndex
            ? {
                ...item,
                quantity: String(Math.max(1, Number(item.quantity || 1)) + quantityNumber),
              }
            : item
        );
      }

      return [
        ...current,
        {
          productId: selectedProduct._id,
          name: selectedProduct.name,
          image: selectedProductImage,
          quantity: String(quantityNumber),
          unitPrice: Number(selectedProduct.price || 0),
          deliveryFee: Number(selectedProduct.deliveryFee || 0),
        },
      ];
    });
    setDraftProductId("");
    setDraftQuantity("1");
  };

  const updateItemQuantity = (targetIndex: number, quantity: string) => {
    setItems((current) =>
      current.map((item, index) =>
        index === targetIndex
          ? { ...item, quantity: quantity.replace(/[^0-9]/g, "") || "1" }
          : item
      )
    );
  };

  const removeItem = (targetIndex: number) => {
    setItems((current) => current.filter((_, index) => index !== targetIndex));
  };

  const updateItemDeliveryFee = (targetIndex: number, value: string) => {
    setItems((current) =>
      current.map((item, index) =>
        index === targetIndex
          ? {
              ...item,
              deliveryFee: Number(value.replace(",", ".") || 0),
            }
          : item
      )
    );
  };

  const submit = async () => {
    if (!form.customerName.trim() || !form.phone.trim() || !items.length) return;
    setSaving(true);
    try {
      await createOrder({
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        city: form.city || undefined,
        address: form.address || undefined,
        email: form.email || undefined,
        customerNote: form.customerNote || undefined,
        deliveryCompany: form.deliveryCompany || undefined,
        exchange: form.exchange,
        items: items.map((item) => ({
          product: item.productId,
          quantity: Math.max(1, Number(item.quantity || 1)),
          price: Number(item.unitPrice || 0),
          deliveryFee: Number(item.deliveryFee || 0),
        })),
      });
      await onCreated();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(15,23,42,0.45)", justifyContent: "center", padding: 20 }}>
        <Card style={{ maxWidth: 880, width: "100%", alignSelf: "center", maxHeight: "90%" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <Text style={{ fontSize: 24, fontWeight: "900", color: "#0F172A" }}>Ajouter une commande</Text>
            <Pressable onPress={onClose}>
              <Text style={{ color: colors.grayText, fontWeight: "900", fontSize: 20 }}>✕</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ gap: 14 }}>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.grayText, fontWeight: "800", marginBottom: 8 }}>Nom client</Text>
                  <Input value={form.customerName} onChangeText={(value) => setValue("customerName", value)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.grayText, fontWeight: "800", marginBottom: 8 }}>Telephone</Text>
                  <Input value={form.phone} onChangeText={(value) => setValue("phone", value)} />
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.grayText, fontWeight: "800", marginBottom: 8 }}>Ville</Text>
                  <FilterSelect
                    value={form.city}
                    title="Choisir une ville"
                    options={[{ key: "", label: "Choisir une ville" }, ...TUNISIA_CITIES.map((city) => ({ key: city, label: city }))]}
                    onChange={(value) => setValue("city", value)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.grayText, fontWeight: "800", marginBottom: 8 }}>Societe de livraison</Text>
                  <FilterSelect
                    value={form.deliveryCompany}
                    title="Choisir une societe de livraison"
                    options={deliveryOptions}
                    onChange={(value) => setValue("deliveryCompany", value)}
                  />
                </View>
              </View>

              <View>
                <Text style={{ color: colors.grayText, fontWeight: "800", marginBottom: 8 }}>Adresse</Text>
                <Input value={form.address} onChangeText={(value) => setValue("address", value)} />
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.grayText, fontWeight: "800", marginBottom: 8 }}>Email</Text>
                  <Input value={form.email} onChangeText={(value) => setValue("email", value)} autoCapitalize="none" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.grayText, fontWeight: "800", marginBottom: 8 }}>Produit</Text>
                  <FilterSelect
                    value={draftProductId}
                    title="Choisir un produit"
                    options={productOptions}
                    onChange={setDraftProductId}
                  />
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.grayText, fontWeight: "800", marginBottom: 8 }}>Quantite</Text>
                  <Input value={draftQuantity} onChangeText={(value) => setDraftQuantity(value.replace(/[^0-9]/g, "") || "1")} keyboardType="number-pad" />
                </View>
                <View style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14, justifyContent: "center", backgroundColor: "#F8FAFC" }}>
                  <Text style={{ color: colors.grayText, fontWeight: "700" }}>Apercu selection</Text>
                  <Text style={{ color: "#6D28D9", fontWeight: "900", fontSize: 22, marginTop: 6 }}>{formatMoney(draftEstimatedTotal)}</Text>
                </View>
              </View>

              {selectedProduct ? (
                <Card style={{ padding: 0, overflow: "hidden" }}>
                  <View style={{ paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <Text style={{ color: "#0F172A", fontWeight: "900", fontSize: 18 }}>Resume de la commande</Text>
                  </View>
                  <View style={{ padding: 16, gap: 14 }}>
                    <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
                      <View
                        style={{
                          width: 62,
                          height: 62,
                          borderRadius: 14,
                          borderWidth: 1,
                          borderColor: colors.border,
                          overflow: "hidden",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#F8FAFC",
                        }}
                      >
                        {selectedProductImage ? (
                          <Image source={{ uri: selectedProductImage }} style={{ width: 62, height: 62 }} />
                        ) : (
                          <Text style={{ color: colors.grayText, fontSize: 12 }}>IMG</Text>
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: "#0F172A", fontWeight: "900", fontSize: 16 }}>
                          {selectedProduct.name}
                        </Text>
                        <Text style={{ color: colors.grayText, marginTop: 4 }}>
                          Quantite: {quantityNumber}
                        </Text>
                      </View>
                    </View>

                    <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: "hidden" }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12, backgroundColor: "#F8FAFC", borderBottomWidth: 1, borderBottomColor: colors.border }}>
                        <Text style={{ color: "#0F172A", fontWeight: "800" }}>Prix unitaire</Text>
                        <Text style={{ color: "#0F172A", fontWeight: "900" }}>{formatMoney(Number(selectedProduct.price || 0))}</Text>
                      </View>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                        <Text style={{ color: "#0F172A", fontWeight: "800" }}>Sous-total</Text>
                        <Text style={{ color: "#0F172A", fontWeight: "900" }}>
                          {formatMoney(draftSubTotal)}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                        <Text style={{ color: "#0F172A", fontWeight: "800" }}>Frais de livraison</Text>
                        <Text style={{ color: "#0F172A", fontWeight: "900" }}>
                          {formatMoney(Number(selectedProduct.deliveryFee || 0))}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 14, backgroundColor: "#EDE9FE" }}>
                        <Text style={{ color: "#5B21B6", fontWeight: "900", fontSize: 16 }}>Total</Text>
                        <Text style={{ color: "#0F172A", fontWeight: "900", fontSize: 18 }}>
                          {formatMoney(draftEstimatedTotal)}
                        </Text>
                      </View>
                    </View>
                    <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                      <Button title="Ajouter au resume" onPress={addSelectedProduct} />
                    </View>
                  </View>
                </Card>
              ) : null}

              {items.length ? (
                <Card style={{ padding: 0, overflow: "hidden" }}>
                  <View style={{ paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <Text style={{ color: "#0F172A", fontWeight: "900", fontSize: 18 }}>Resume des commandes</Text>
                  </View>
                  <View style={{ padding: 16, gap: 12 }}>
                    <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: "hidden" }}>
                      <View style={{ flexDirection: "row", backgroundColor: "#F8FAFC", paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                        <Text style={{ flex: 2.2, color: "#0F172A", fontWeight: "900" }}>Produit</Text>
                        <Text style={{ width: 90, color: "#0F172A", fontWeight: "900" }}>Quantite</Text>
                        <Text style={{ width: 120, color: "#0F172A", fontWeight: "900" }}>Prix</Text>
                        <Text style={{ width: 130, color: "#0F172A", fontWeight: "900" }}>Livraison</Text>
                        <Text style={{ width: 120, color: "#0F172A", fontWeight: "900" }}>Total</Text>
                        <Text style={{ width: 60, color: "#0F172A", fontWeight: "900", textAlign: "center" }}>Action</Text>
                      </View>

                      {items.map((item, index) => {
                        const lineTotal =
                          Number(item.unitPrice || 0) * Math.max(1, Number(item.quantity || 1)) +
                          Number(item.deliveryFee || 0);

                        return (
                          <View
                            key={`${item.productId}-${index}`}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              paddingHorizontal: 12,
                              paddingVertical: 12,
                              borderBottomWidth: index === items.length - 1 ? 0 : 1,
                              borderBottomColor: colors.border,
                              backgroundColor: "white",
                            }}
                          >
                            <View style={{ flex: 2.2, flexDirection: "row", alignItems: "center", gap: 10, paddingRight: 10 }}>
                              <View
                                style={{
                                  width: 46,
                                  height: 46,
                                  borderRadius: 12,
                                  borderWidth: 1,
                                  borderColor: colors.border,
                                  overflow: "hidden",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  backgroundColor: "#F8FAFC",
                                }}
                              >
                                {item.image ? (
                                  <Image source={{ uri: item.image }} style={{ width: 46, height: 46 }} />
                                ) : (
                                  <Text style={{ color: colors.grayText, fontSize: 12 }}>IMG</Text>
                                )}
                              </View>
                              <Text style={{ flex: 1, color: "#0F172A", fontWeight: "800" }}>{item.name}</Text>
                            </View>

                            <View style={{ width: 90, paddingRight: 10 }}>
                              <Input value={item.quantity} onChangeText={(value) => updateItemQuantity(index, value)} keyboardType="number-pad" />
                            </View>

                            <View style={{ width: 120, paddingRight: 10 }}>
                              <Text style={{ color: "#0F172A", fontWeight: "800" }}>{formatMoney(item.unitPrice)}</Text>
                            </View>

                            <View style={{ width: 130, paddingRight: 10 }}>
                              <Input
                                value={String(item.deliveryFee)}
                                onChangeText={(value) => updateItemDeliveryFee(index, value)}
                                keyboardType="decimal-pad"
                              />
                            </View>

                            <View style={{ width: 120, paddingRight: 10 }}>
                              <Text style={{ color: "#0F172A", fontWeight: "900" }}>{formatMoney(lineTotal)}</Text>
                            </View>

                            <View style={{ width: 60, alignItems: "center" }}>
                              <Pressable onPress={() => removeItem(index)}>
                                <Text style={{ color: "#DC2626", fontWeight: "900", fontSize: 18 }}>🗑</Text>
                              </Pressable>
                            </View>
                          </View>
                        );
                      })}
                    </View>

                    <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: "hidden" }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                        <Text style={{ color: "#0F172A", fontWeight: "800" }}>Sous-total produits</Text>
                        <Text style={{ color: "#0F172A", fontWeight: "900" }}>{formatMoney(itemsSubTotal)}</Text>
                      </View>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                        <Text style={{ color: "#0F172A", fontWeight: "800" }}>Frais de livraison</Text>
                        <Text style={{ color: "#0F172A", fontWeight: "900" }}>{formatMoney(itemsDeliveryTotal)}</Text>
                      </View>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 14, backgroundColor: "#EDE9FE" }}>
                        <Text style={{ color: "#5B21B6", fontWeight: "900", fontSize: 16 }}>Total final</Text>
                        <Text style={{ color: "#0F172A", fontWeight: "900", fontSize: 18 }}>{formatMoney(finalTotal)}</Text>
                      </View>
                    </View>
                  </View>
                </Card>
              ) : null}

              <View>
                <Text style={{ color: colors.grayText, fontWeight: "800", marginBottom: 8 }}>Note client</Text>
                <Input value={form.customerNote} onChangeText={(value) => setValue("customerNote", value)} multiline style={{ minHeight: 90, textAlignVertical: "top" as any }} />
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 }}>
                <Text style={{ color: "#0F172A", fontWeight: "800" }}>Commande echange</Text>
                <Switch value={form.exchange} onValueChange={(value) => setValue("exchange", value)} />
              </View>
            </View>
          </ScrollView>

          <View style={{ flexDirection: "row", gap: 12, marginTop: 18 }}>
            <View style={{ flex: 1 }}>
              <Button title="Annuler" variant="ghost" onPress={onClose} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title={saving ? "Enregistrement..." : "Ajouter la commande"} onPress={submit} disabled={saving} />
            </View>
          </View>
        </Card>
      </View>
    </Modal>
  );
}

export default function OrdersListScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1180;

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [providers, setProviders] = useState<DeliveryProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<OrdersTab>("commandes");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [deliveryFilter, setDeliveryFilter] = useState<string>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [historyOrderId, setHistoryOrderId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const hasBootstrappedAlertRef = useRef(false);
  const knownOrderIdsRef = useRef<string[]>([]);
  const pageSize = 8;

  const loadOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await getOrders();
      const nextIds = data.map((order) => order._id);
      const newOrders = data.filter((order) => !knownOrderIdsRef.current.includes(order._id));
      const hasNewOrder =
        hasBootstrappedAlertRef.current &&
        newOrders.length > 0;

      knownOrderIdsRef.current = nextIds;
      hasBootstrappedAlertRef.current = true;
      setOrders(data);

      if (hasNewOrder) {
        await playNewOrderAlert();
      }
    } catch (error) {
      if ((error as { response?: { status?: number } })?.response?.status === 401) {
        await logout();
        router.replace("/login");
        return;
      }
      throw error;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadLookups = async () => {
    const [productsList, enabledProviders] = await Promise.all([
      getProducts(),
      getEnabledDeliveryProviders(),
    ]);

    setProducts(productsList);
    setProviders(enabledProviders.map((item) => item.provider));
  };

  useEffect(() => {
    loadOrders();
    loadLookups().catch(console.error);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadOrders(true);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const productOptions = useMemo(
    () => [{ key: "all", label: "Produit" }, ...products.map((product) => ({ key: product._id, label: product.name }))],
    [products]
  );
  const deliveryOptions = useMemo(
    () => [{ key: "all", label: "Livraison" }, ...providers.map((provider) => ({ key: provider.name, label: provider.name }))],
    [providers]
  );
  const cityOptions = useMemo(
    () => [{ key: "all", label: "Ville" }, ...TUNISIA_CITIES.map((city) => ({ key: city, label: city }))],
    []
  );

  const counts = useMemo(() => {
    const total = orders.filter((order) => !order.isDeleted && !order.isArchived && !order.isAbandoned).length;
    const abandoned = orders.filter(
      (order) =>
        !order.isDeleted &&
        !order.isArchived &&
        !!order.isAbandoned
    ).length;
    const deleted = orders.filter((order) => order.isDeleted).length;
    const archived = orders.filter((order) => order.isArchived && !order.isDeleted).length;
    return { total, abandoned, deleted, archived };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const search = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesTab =
        activeTab === "commandes"
          ? !order.isDeleted && !order.isArchived && !order.isAbandoned
          : activeTab === "abandonnee"
            ? !order.isDeleted && !order.isArchived && !!order.isAbandoned
            : activeTab === "supprimee"
              ? !!order.isDeleted
              : !!order.isArchived && !order.isDeleted;
      const firstProduct = order.items[0];
      const productTitle = firstProduct ? getProductTitle(firstProduct).toLowerCase() : "";
      const productId =
        typeof firstProduct?.product === "string" ? firstProduct.product : firstProduct?.product?._id || "";

      const matchesSearch =
        !search ||
        order.customerName.toLowerCase().includes(search) ||
        order.phone.toLowerCase().includes(search) ||
        productTitle.includes(search) ||
        order._id.toLowerCase().includes(search);

      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesPeriodValue = matchesPeriod(order.createdAt, periodFilter);
      const matchesProduct =
        productFilter === "all" ||
        String(productId).toLowerCase() === productFilter.toLowerCase();
      const matchesCity =
        cityFilter === "all" ||
        String(order.city || "").trim().toLowerCase() === cityFilter.toLowerCase();
      const matchesDelivery =
        deliveryFilter === "all" ||
        String(order.deliveryCompany || "").trim().toLowerCase() === deliveryFilter.toLowerCase();

      return matchesTab && matchesSearch && matchesStatus && matchesPeriodValue && matchesProduct && matchesCity && matchesDelivery;
    });
  }, [activeTab, cityFilter, deliveryFilter, orders, periodFilter, productFilter, query, statusFilter]);

  const totalRevenue = useMemo(
    () => filteredOrders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    [filteredOrders]
  );

  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const pagedOrders = useMemo(
    () => filteredOrders.slice((page - 1) * pageSize, page * pageSize),
    [filteredOrders, page]
  );

  const historyOrder = filteredOrders.find((order) => order._id === historyOrderId) || null;

  useEffect(() => {
    setPage(1);
  }, [activeTab, query, statusFilter, periodFilter, productFilter, cityFilter, deliveryFilter]);

  useEffect(() => {
    setSelectedOrderIds((current) => current.filter((id) => filteredOrders.some((order) => order._id === id)));
  }, [filteredOrders]);

  const allPageSelected =
    pagedOrders.length > 0 && pagedOrders.every((order) => selectedOrderIds.includes(order._id));

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrderIds((current) =>
      current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId]
    );
  };

  const toggleSelectCurrentPage = () => {
    setSelectedOrderIds((current) => {
      if (allPageSelected) {
        return current.filter((id) => !pagedOrders.some((order) => order._id === id));
      }
      const next = [...current];
      pagedOrders.forEach((order) => {
        if (!next.includes(order._id)) next.push(order._id);
      });
      return next;
    });
  };

  const performBulkAction = async (action: "archive" | "delete" | "restore") => {
    const targets = [...selectedOrderIds];
    if (!targets.length) return;

    if (action === "archive") {
      await Promise.all(targets.map((id) => archiveOrder(id)));
    } else if (action === "delete") {
      await Promise.all(targets.map((id) => deleteOrder(id)));
    } else {
      await Promise.all(targets.map((id) => restoreOrder(id)));
    }

    setSelectedOrderIds([]);
    await loadOrders(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <CreateOrderModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={async () => {
          await loadOrders(true);
        }}
        products={products}
        providers={providers}
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadOrders(true);
            }}
          />
        }
      >
        <View
          style={{
            flexDirection: isDesktop ? "row" : "column",
            justifyContent: "space-between",
            alignItems: isDesktop ? "center" : "flex-start",
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Badge label="OPERATIONS NOVIKA" tone="violet" />
            <View style={{ marginTop: 10 }}>
              <SectionTitle
                title="Gestion des commandes"
                subtitle="Pilotez commandes reelles, abandons, archivage et relances depuis une seule vue organisee."
              />
            </View>
          </View>

          <View style={{ width: isDesktop ? 250 : "100%" }}>
            <Button title="Ajouter une commande" variant="orange" onPress={() => setShowCreateModal(true)} />
          </View>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {[
              { key: "commandes", label: "Commandes", count: counts.total },
              { key: "abandonnee", label: "Abandonnee", count: counts.abandoned },
              { key: "supprimee", label: "Supprimee", count: counts.deleted },
              { key: "archivee", label: "Archivee", count: counts.archived },
            ].map((tab) => (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key as OrdersTab)}
                style={{
                  backgroundColor: activeTab === tab.key ? "white" : "#E2E8F0",
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: activeTab === tab.key ? colors.border : "transparent",
                  paddingHorizontal: 18,
                  paddingVertical: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Text style={{ color: activeTab === tab.key ? "#0F172A" : "#64748B", fontWeight: "800" }}>
                  {tab.label}
                </Text>
                {tab.count > 0 ? (
                  <View
                    style={{
                      minWidth: 24,
                      height: 24,
                      borderRadius: 999,
                      backgroundColor: activeTab === tab.key ? "#E2E8F0" : "#CBD5E1",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 6,
                    }}
                  >
                    <Text style={{ color: colors.blue, fontWeight: "800", fontSize: 12 }}>{tab.count}</Text>
                  </View>
                ) : null}
              </Pressable>
            ))}
          </ScrollView>

          <View style={{ flexDirection: "row", gap: 10, display: "none" as any }}>
            <Pressable
              onPress={() => setShowCreateModal(true)}
              style={{
                width: 54,
                height: 54,
                borderRadius: 14,
                backgroundColor: "#6D28D9",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "white", fontSize: 22, fontWeight: "900" }}>⌘</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowCreateModal(true)}
              style={{
                borderRadius: 14,
                backgroundColor: "#6D28D9",
                paddingHorizontal: 20,
                alignItems: "center",
                justifyContent: "center",
                minHeight: 54,
              }}
            >
              <Text style={{ color: "white", fontSize: 20, fontWeight: "900" }}>Ajouter une commande +</Text>
            </Pressable>
          </View>
        </View>

        {selectedOrderIds.length > 0 ? (
          <Card style={{ padding: 12 }}>
            <View style={{ flexDirection: isDesktop ? "row" : "column", alignItems: isDesktop ? "center" : "stretch", justifyContent: "space-between", gap: 12 }}>
              <Text style={{ color: "#0F172A", fontWeight: "800" }}>
                {selectedOrderIds.length} commande(s) selectionnee(s)
              </Text>
              <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                {activeTab !== "archivee" ? (
                  <Pressable
                    onPress={() => performBulkAction("archive")}
                    style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: "#EDE9FE", borderWidth: 1, borderColor: "#DDD6FE" }}
                  >
                    <Text style={{ color: "#6D28D9", fontWeight: "900" }}>Archiver</Text>
                  </Pressable>
                ) : null}
                {activeTab === "archivee" || activeTab === "supprimee" ? (
                  <Pressable
                    onPress={() => performBulkAction("restore")}
                    style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: "#DCFCE7", borderWidth: 1, borderColor: "#BBF7D0" }}
                  >
                    <Text style={{ color: "#166534", fontWeight: "900" }}>Restaurer</Text>
                  </Pressable>
                ) : null}
                {activeTab !== "supprimee" ? (
                  <Pressable
                    onPress={() => performBulkAction("delete")}
                    style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: "#FEE2E2", borderWidth: 1, borderColor: "#FECACA" }}
                  >
                    <Text style={{ color: "#B91C1C", fontWeight: "900" }}>Supprimer</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </Card>
        ) : null}

        <Card style={{ padding: 14 }}>
          <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 12, alignItems: isDesktop ? "center" : "stretch" }}>
            <View style={{ flex: 1.2 }}>
              <View
                style={{
                  minHeight: 54,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: "white",
                  paddingHorizontal: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Text style={{ color: "#94A3B8", fontSize: 18 }}>⌕</Text>
                <Input
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Rechercher..."
                  style={{
                    flex: 1,
                    borderWidth: 0,
                    paddingHorizontal: 0,
                    paddingVertical: 0,
                    minHeight: 0,
                  }}
                />
              </View>
            </View>
            <FilterSelect
              value={statusFilter}
              options={STATUS_OPTIONS}
              onChange={setStatusFilter}
              renderSelected={(option) => {
                if (option.key === "all") {
                  return <Text style={{ color: "#64748B", fontWeight: "700" }}>{option.label}</Text>;
                }
                const theme = getStatusTheme(option.key);
                return (
                  <View style={{ alignSelf: "flex-start", backgroundColor: theme.bg, borderColor: theme.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
                    <Text style={{ color: theme.text, fontWeight: "800" }}>{option.label}</Text>
                  </View>
                );
              }}
            />
            <FilterSelect value={periodFilter} options={PERIOD_OPTIONS} onChange={setPeriodFilter} />
            <Pressable
              onPress={() => setShowAdvancedFilters((current) => !current)}
              style={{
                minHeight: 54,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "white",
              }}
            >
              <Text style={{ color: "#0F172A", fontWeight: "900" }}>Filtre avance {showAdvancedFilters ? "−" : "+"}</Text>
            </Pressable>
            <View style={{ minHeight: 54, borderRadius: 14, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, backgroundColor: "white", flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Switch value />
              <Text style={{ color: "#0F172A", fontWeight: "800" }}>Toutes les commandes</Text>
            </View>
          </View>

          {showAdvancedFilters ? (
            <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 12, marginTop: 14 }}>
              <FilterSelect value={productFilter} options={productOptions} onChange={setProductFilter} />
              <FilterSelect value={cityFilter} options={cityOptions} onChange={setCityFilter} />
              <FilterSelect value={deliveryFilter} options={deliveryOptions} onChange={setDeliveryFilter} />
            </View>
          ) : null}
        </Card>

        <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 12 }}>
          <Card style={{ flex: 1 }}>
            <Text style={{ color: colors.grayText, fontWeight: "700" }}>Total commandes</Text>
            <Text style={{ color: colors.blue, fontSize: 30, fontWeight: "900", marginTop: 8 }}>{filteredOrders.length}</Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text style={{ color: colors.grayText, fontWeight: "700" }}>Valeur totale</Text>
            <Text style={{ color: colors.orange, fontSize: 30, fontWeight: "900", marginTop: 8 }}>{formatMoney(totalRevenue)}</Text>
          </Card>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 36 }}>
            <ActivityIndicator />
          </View>
        ) : (
          <View style={{ flexDirection: isDesktop ? "row" : "column", alignItems: "flex-start", gap: 16 }}>
            <Card style={{ flex: 1, padding: 0, overflow: "hidden" }}>
              <View style={{ paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: "#F8FAFC" }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Pressable
                    onPress={toggleSelectCurrentPage}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: allPageSelected ? colors.blue : "#CBD5E1",
                      backgroundColor: allPageSelected ? colors.blue : "white",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Text style={{ color: allPageSelected ? "white" : "#94A3B8", fontWeight: "900" }}>✓</Text>
                  </Pressable>
                  <Text style={{ width: 80, fontWeight: "900", color: colors.blue }}>ID</Text>
                  <Text style={{ flex: 1.7, fontWeight: "900", color: colors.blue }}>Produits</Text>
                  <Text style={{ flex: 1.2, fontWeight: "900", color: colors.blue }}>Client</Text>
                  <Text style={{ flex: 1.5, fontWeight: "900", color: colors.blue }}>Date</Text>
                  <Text style={{ flex: 1.2, fontWeight: "900", color: colors.blue }}>Livraison</Text>
                  <Text style={{ flex: 1.2, fontWeight: "900", color: colors.blue }}>Statut</Text>
                  <Text style={{ width: 110, fontWeight: "900", color: colors.blue, textAlign: "right" }}>Total</Text>
                  <Text style={{ width: 110, fontWeight: "900", color: colors.blue, textAlign: "right" }}>Actions</Text>
                </View>
              </View>

              {pagedOrders.map((order, index) => {
                const firstItem = order.items[0];
                const imageUri = firstItem ? getProductImage(firstItem) : null;
                const showHistory = order.status !== "en_attente";

                return (
                  <View
                    key={order._id}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 14,
                      borderBottomWidth: index === pagedOrders.length - 1 ? 0 : 1,
                      borderBottomColor: colors.border,
                      backgroundColor: historyOrderId === order._id ? "#FCFAFF" : "white",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Pressable
                        onPress={() => toggleSelectOrder(order._id)}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: selectedOrderIds.includes(order._id) ? colors.blue : "#CBD5E1",
                          backgroundColor: selectedOrderIds.includes(order._id) ? colors.blue : "white",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Text style={{ color: selectedOrderIds.includes(order._id) ? "white" : "#94A3B8", fontWeight: "900" }}>✓</Text>
                      </Pressable>
                      <Text style={{ width: 80, color: "#0F172A", fontWeight: "700" }}>{order._id.slice(-4)}</Text>
                      <View style={{ flex: 1.7, flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: "#F8FAFC", overflow: "hidden", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border }}>
                          {imageUri ? <Image source={{ uri: imageUri }} style={{ width: 42, height: 42 }} /> : <Text style={{ color: colors.grayText, fontSize: 11 }}>IMG</Text>}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: "#0F172A", fontWeight: "800" }}>{firstItem ? getProductTitle(firstItem) : "Produit"}</Text>
                          <Text style={{ color: colors.grayText, marginTop: 3 }}>x{firstItem?.quantity || 0}</Text>
                        </View>
                      </View>
                      <View style={{ flex: 1.2 }}>
                        <Text style={{ color: "#0F172A", fontWeight: "800" }}>{order.customerName}</Text>
                        <Text style={{ color: colors.grayText, marginTop: 3 }}>{order.phone}</Text>
                      </View>
                      <Text style={{ flex: 1.5, color: colors.grayText }}>{formatDate(order.createdAt)}</Text>
                      <View style={{ flex: 1.2 }}>
                        <Text style={{ color: "#0F172A", fontWeight: "700" }}>{order.deliveryCompany || "-"}</Text>
                      </View>
                      <View style={{ flex: 1.2 }}>
                        <StatusBadge
                          status={order.status}
                          onPress={showHistory ? () => setHistoryOrderId((current) => (current === order._id ? null : order._id)) : undefined}
                        />
                      </View>
                      <Text style={{ width: 110, color: colors.blue, fontWeight: "900", textAlign: "right" }}>{formatMoney(order.total)}</Text>
                      <View style={{ width: 110, flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
                        <Pressable onPress={() => router.push(`/orders/${order._id}` as never)}>
                          <Text style={{ color: colors.blue, fontWeight: "900" }}>◉</Text>
                        </Pressable>
                        <Pressable onPress={() => router.push(`/orders/${order._id}` as never)}>
                          <Text style={{ color: "#475569", fontWeight: "900" }}>✎</Text>
                        </Pressable>
                        {activeTab === "archivee" || activeTab === "supprimee" ? (
                          <Pressable onPress={() => restoreOrder(order._id).then(() => loadOrders(true))}>
                            <Text style={{ color: "#166534", fontWeight: "900" }}>↺</Text>
                          </Pressable>
                        ) : (
                          <>
                            <Pressable onPress={() => archiveOrder(order._id).then(() => loadOrders(true))}>
                              <Text style={{ color: "#6D28D9", fontWeight: "900" }}>⌂</Text>
                            </Pressable>
                            <Pressable onPress={() => deleteOrder(order._id).then(() => loadOrders(true))}>
                              <Text style={{ color: "#B91C1C", fontWeight: "900" }}>🗑</Text>
                            </Pressable>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}

              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  paddingHorizontal: 14,
                  paddingVertical: 14,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.grayText, fontWeight: "700" }}>
                  Lignes par page: {pageSize}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Text style={{ color: colors.grayText, fontWeight: "700" }}>
                    Page {page} / {pageCount}
                  </Text>
                  <Pressable
                    onPress={() => setPage((current) => Math.max(1, current - 1))}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: page === 1 ? "#F8FAFC" : "white",
                    }}
                  >
                    <Text style={{ color: page === 1 ? "#94A3B8" : "#0F172A", fontWeight: "900" }}>←</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setPage((current) => Math.min(pageCount, current + 1))}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: page === pageCount ? "#F8FAFC" : "white",
                    }}
                  >
                    <Text style={{ color: page === pageCount ? "#94A3B8" : "#0F172A", fontWeight: "900" }}>→</Text>
                  </Pressable>
                </View>
              </View>
            </Card>

            {isDesktop ? <HistoryPopover order={historyOrder} /> : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
}



