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
import { Badge, Button, Card, Input, SectionTitle } from "../src/ui/atoms";
import { colors } from "../src/ui/theme";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../src/services/categories.service";

import type { Category } from "../src/types/category";

function toast(title: string, message?: string) {
  if (Platform.OS === "web") window.alert(message ? `${title}\n\n${message}` : title);
  else Alert.alert(title, message ?? "");
}

export default function CategoriesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const [list, setList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    isActive: true,
  });

  const title = useMemo(() => "Gestion des Catégories", []);

  const load = async () => {
    setLoading(true);
    try {
      const items = await getCategories();
      items.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      setList(items);
    } catch (e: any) {
      toast("Erreur", "Impossible de charger les catégories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      slug: "",
      description: "",
      image: "",
      isActive: true,
    });
  };

  const startCreate = () => {
    setEditingId(null);
    resetForm();
    setShowCreate(true);
  };

  const startEdit = (c: Category) => {
    setShowCreate(false);
    setEditingId(c._id);
    setForm({
      name: c.name || "",
      slug: c.slug || "",
      description: c.description || "",
      image: c.image || "",
      isActive: c.isActive !== false,
    });
  };

  const onCreate = async () => {
    const name = form.name.trim();
    if (!name) return toast("Erreur", "Nom obligatoire");

    setCreating(true);
    try {
      await createCategory({
        name,
        slug: form.slug.trim() || undefined,
        description: form.description || undefined,
        image: form.image.trim() || undefined,
        isActive: form.isActive,
      });
      toast("✅ OK", "Catégorie créée");
      setShowCreate(false);
      resetForm();
      await load();
    } catch (e: any) {
      toast("Erreur", e?.response?.data?.message || "Création impossible");
    } finally {
      setCreating(false);
    }
  };

  const onSave = async () => {
    if (!editingId) return;
    const name = form.name.trim();
    if (!name) return toast("Erreur", "Nom obligatoire");

    setSavingId(editingId);
    try {
      await updateCategory(editingId, {
        name,
        slug: form.slug.trim() || undefined,
        description: form.description || undefined,
        image: form.image.trim() || undefined,
        isActive: form.isActive,
      });
      toast("✅ OK", "Catégorie mise à jour");
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
    const ok = Platform.OS === "web" ? window.confirm("Supprimer cette catégorie ?") : true;
    if (!ok) return;

    try {
      await deleteCategory(id);
      toast("✅ OK", "Supprimée");
      await load();
    } catch (e: any) {
      toast("Erreur", e?.response?.data?.message || "Suppression impossible");
    }
  };

  const toggleActive = () => setForm((p) => ({ ...p, isActive: !p.isActive }));

  const renderForm = (mode: "create" | "edit") => {
    const submitting = mode === "create" ? creating : savingId === editingId;

    return (
      <Card style={{ marginBottom: 14 }}>
        <Text style={{ fontSize: 16, fontWeight: "900", color: colors.blue }}>
          {mode === "create" ? "Nouvelle Catégorie" : "Modifier Catégorie"}
        </Text>

        <Text style={{ marginTop: 12, marginBottom: 6, fontWeight: "800", color: colors.blue }}>Nom</Text>
        <Input value={form.name} onChangeText={(v) => setForm((p) => ({ ...p, name: v }))} placeholder="ex: shoes" />

        <Text style={{ marginTop: 12, marginBottom: 6, fontWeight: "800", color: colors.blue }}>Slug</Text>
        <Input value={form.slug} onChangeText={(v) => setForm((p) => ({ ...p, slug: v }))} placeholder="ex: shoes" />

        <Text style={{ marginTop: 12, marginBottom: 6, fontWeight: "800", color: colors.blue }}>Description</Text>
        <Input
          value={form.description}
          onChangeText={(v) => setForm((p) => ({ ...p, description: v }))}
          placeholder="Description..."
          multiline
          style={{ minHeight: 80, textAlignVertical: "top" as any }}
        />

        <Text style={{ marginTop: 12, marginBottom: 6, fontWeight: "800", color: colors.blue }}>Image (URL)</Text>
        <Input value={form.image} onChangeText={(v) => setForm((p) => ({ ...p, image: v }))} placeholder="https://..." />

        <View style={{ marginTop: 12 }}>
          <Pressable
            onPress={toggleActive}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10 as any,
              paddingVertical: 8,
            }}
          >
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: form.isActive ? colors.blue : "#9CA3AF",
                backgroundColor: form.isActive ? colors.blue : "transparent",
              }}
            />
            <Text style={{ fontWeight: "800", color: "#111827" }}>
              Active
            </Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: isWide ? "row" : "column", gap: 10 as any, marginTop: 14 }}>
          <View style={{ flex: 1 }}>
            <Button
              title={submitting ? (mode === "create" ? "Création..." : "Enregistrement...") : mode === "create" ? "Créer" : "Enregistrer"}
              onPress={mode === "create" ? onCreate : onSave}
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
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
            <Badge label="CATEGORIES NOVIKA" tone="blue" />
            <View style={{ marginTop: 10 }}>
              <SectionTitle
                title={title}
                subtitle="Organisez le catalogue avec des categories plus visuelles, actives et simples a maintenir pour l'equipe."
              />
            </View>
          </View>

          <View style={{ width: isWide ? 210 : "100%" }}>
            <Button
              title={showCreate ? "Fermer" : "Nouvelle categorie"}
              variant="orange"
              onPress={() => (showCreate ? setShowCreate(false) : startCreate())}
            />
          </View>
        </View>
        <View style={{ marginBottom: 12, width: isWide ? 220 : "100%" }}>
          <Button title="Retour produits" variant="ghost" onPress={() => router.push("/products")} />
        </View>
        {/* quick nav back to products */}
        <View style={{ marginBottom: 12, display: "none" as any }}>
          <Button title="🛍️ Retour Produits" variant="ghost" onPress={() => router.push("/products")} />
        </View>

        {showCreate && renderForm("create")}
        {editingId && renderForm("edit")}

        {loading ? (
          <View style={{ padding: 20 }}>
            <ActivityIndicator />
            <Text style={{ textAlign: "center", marginTop: 10 }}>Chargement...</Text>
          </View>
        ) : isWide ? (
          <Card>
            <Text style={{ fontWeight: "900", color: colors.blue, marginBottom: 10 }}>Catégories</Text>
            {list.length === 0 ? (
              <Text style={{ color: "#6B7280", fontWeight: "700" }}>Aucune catégorie</Text>
            ) : (
              list.map((c) => (
                <View
                  key={c._id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 10,
                    borderTopWidth: 1,
                    borderTopColor: "#E5E7EB",
                  }}
                >
                  <View style={{ flex: 2 }}>
                    <Text style={{ fontWeight: "900" }}>{c.name}</Text>
                    <Text style={{ color: "#6B7280", marginTop: 2 }}>
                      slug: {c.slug || "-"} • active: {c.isActive === false ? "non" : "oui"}
                    </Text>
                    {c.description ? <Text style={{ color: "#6B7280", marginTop: 2 }}>{c.description}</Text> : null}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#6B7280" }} numberOfLines={1 as any}>
                      {c.image || "-"}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", gap: 10 as any }}>
                    <Button title="✏️" variant="ghost" onPress={() => startEdit(c)} />
                    <Button title="🗑️" variant="orange" onPress={() => onDelete(c._id)} />
                  </View>
                </View>
              ))
            )}
          </Card>
        ) : (
          list.map((c) => (
            <Card key={c._id} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "900", color: colors.blue }}>{c.name}</Text>
                  <Text style={{ color: "#6B7280", marginTop: 4, fontWeight: "700" }}>
                    slug: {c.slug || "-"} • active: {c.isActive === false ? "non" : "oui"}
                  </Text>
                  {c.description ? (
                    <Text style={{ color: "#6B7280", marginTop: 6 }}>{c.description}</Text>
                  ) : null}
                </View>

                <View style={{ flexDirection: "row", gap: 10 as any }}>
                  <Pressable onPress={() => startEdit(c)} style={{ padding: 8 }}>
                    <Text style={{ fontSize: 18 }}>✏️</Text>
                  </Pressable>
                  <Pressable onPress={() => onDelete(c._id)} style={{ padding: 8 }}>
                    <Text style={{ fontSize: 18 }}>🗑️</Text>
                  </Pressable>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}
