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
  getPermissionModules,
  createPermissionModule,
  updatePermissionModule,
  deletePermissionModule,
} from "../src/services/permissions.service";
import type { PermissionModule, CrudAction } from "../src/constants/permissions";

function toast(title: string, message?: string) {
  if (Platform.OS === "web") window.alert(message ? `${title}\n\n${message}` : title);
  else Alert.alert(title, message ?? "");
}

const ACTIONS: { key: CrudAction; label: string }[] = [
  { key: "read", label: "Lire" },
  { key: "create", label: "Créer" },
  { key: "update", label: "Modifier" },
  { key: "delete", label: "Supprimer" },
];

function Checkbox({
  checked,
  onPress,
  disabled,
}: {
  checked: boolean;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={{
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: checked ? colors.blue : "#CBD5E1",
        backgroundColor: checked ? colors.blue : "transparent",
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {checked ? <Text style={{ color: "white", fontSize: 12, fontWeight: "900" }}>✓</Text> : null}
    </Pressable>
  );
}

const defaultActions = () => ({ read: true, create: true, update: true, delete: true });

export default function PermissionsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const [list, setList] = useState<PermissionModule[]>([]);
  const [loading, setLoading] = useState(true);

  // create
  const [showCreate, setShowCreate] = useState(false);
  const [newModule, setNewModule] = useState("");
  const [newActions, setNewActions] = useState<Record<string, boolean>>(defaultActions());
  const [creating, setCreating] = useState(false);

  // edit
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [draftActions, setDraftActions] = useState<Record<string, Record<string, boolean>>>({});
  const [savingModule, setSavingModule] = useState<string | null>(null);

  const title = useMemo(() => "Gestion des Permissions", []);

  const load = async () => {
    setLoading(true);
    try {
      const items = await getPermissionModules();
      items.sort((a, b) => a.module.localeCompare(b.module));
      setList(items);

      const map: Record<string, Record<string, boolean>> = {};
      items.forEach((p) => (map[p.module] = p.actions || {}));
      setDraftActions(map);
    } catch (e) {
      toast("Erreur", "Impossible de charger les permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleNewAction = (a: CrudAction) => {
    setNewActions((prev) => ({ ...prev, [a]: !prev[a] }));
  };

  const toggleDraftAction = (module: string, a: CrudAction) => {
    setDraftActions((prev) => ({
      ...prev,
      [module]: { ...(prev[module] || {}), [a]: !(prev[module]?.[a] ?? false) },
    }));
  };

  const onCreate = async () => {
    const mod = newModule.trim();
    if (!mod) return toast("Erreur", "Nom du module obligatoire");

    const hasAny = Object.values(newActions).some(Boolean);
    if (!hasAny) return toast("Erreur", "Choisis au moins une action");

    setCreating(true);
    try {
      await createPermissionModule(mod, newActions);
      toast("✅ OK", "Module créé");
      setNewModule("");
      setNewActions(defaultActions());
      setShowCreate(false);
      await load();
    } catch (e: any) {
      toast("Erreur", e?.response?.data?.message || "Création impossible");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (module: string) => setEditingModule(module);

  const cancelEdit = () => {
    const map: Record<string, Record<string, boolean>> = {};
    list.forEach((p) => (map[p.module] = p.actions || {}));
    setDraftActions(map);
    setEditingModule(null);
  };

  const saveEdit = async (module: string) => {
    const actions = draftActions[module] || {};
    const hasAny = Object.values(actions).some(Boolean);
    if (!hasAny) return toast("Erreur", "Choisis au moins une action");

    setSavingModule(module);
    try {
      await updatePermissionModule(module, actions);
      toast("✅ OK", "Actions mises à jour");
      setEditingModule(null);
      await load();
    } catch (e: any) {
      toast("Erreur", e?.response?.data?.message || "Update impossible");
    } finally {
      setSavingModule(null);
    }
  };

  const onDelete = async (module: string) => {
    const ok = Platform.OS === "web" ? window.confirm(`Supprimer ${module} ?`) : true;
    if (!ok) return;

    try {
      await deletePermissionModule(module);
      toast("✅ OK", "Supprimé");
      await load();
    } catch (e: any) {
      toast("Erreur", e?.response?.data?.message || "Suppression impossible");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={{ display: "none", backgroundColor: colors.blue, paddingTop: 14, paddingBottom: 14 }}>
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
              Super Admin
            </Text>
          </View>

          <View style={{ width: 140 }}>
            <Button title="Retour" variant="ghost" onPress={() => router.back()} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} >
        <View style={{ marginBottom: 18, gap: 10 }}>
          <Badge label="SECURITE NOVIKA" tone="muted" />
          <SectionTitle
            title="Modules et permissions"
            subtitle="Centralise les droits d'acces de l'equipe admin dans une interface claire et stable."
          />
          <View style={{ width: isWide ? 220 : "100%" }}>
            <Button title="Retour admins" variant="ghost" onPress={() => router.push("/admins")} />
          </View>
        </View>
        {/* Top actions */}
        <View
          style={{
            flexDirection: isWide ? "row" : "column",
            justifyContent: "space-between",
            alignItems: isWide ? "center" : "flex-start",
            gap: 12 as any,
            marginBottom: 14,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "900", color: colors.navy }}>
            Modules & Actions (CRUD)
          </Text>

          <View style={{ width: isWide ? 240 : "100%" }}>
            <Button
              title={showCreate ? "Fermer" : "➕ Ajouter module"}
              variant="orange"
              onPress={() => setShowCreate((v) => !v)}
            />
          </View>
        </View>

        {/* Create */}
        {showCreate && (
          <Card style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 16, fontWeight: "900", color: colors.blue }}>Nouveau module</Text>

            <Text style={{ marginTop: 12, marginBottom: 6, fontWeight: "800", color: colors.blue }}>
              Nom du module (ex: products)
            </Text>
            <Input value={newModule} onChangeText={setNewModule} autoCapitalize="none" placeholder="products" />

            <Text style={{ marginTop: 12, marginBottom: 8, fontWeight: "800", color: colors.blue }}>
              Actions autorisées
            </Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 as any }}>
              {ACTIONS.map((a) => (
                <View key={a.key} style={{ flexDirection: "row", alignItems: "center", gap: 8 as any, marginRight: 12, marginTop: 10 }}>
                  <Checkbox checked={!!newActions[a.key]} onPress={() => toggleNewAction(a.key)} />
                  <Text style={{ fontWeight: "800", color: "#111827" }}>{a.label}</Text>
                </View>
              ))}
            </View>

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
          list.map((p) => {
            const isEditing = editingModule === p.module;
            const actions = isEditing ? draftActions[p.module] || {} : p.actions || {};

            return (
              <Card key={p.module} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: "900", color: colors.blue }}>
                      {p.module}
                    </Text>

                    {/* show actions as text (summary) */}
                    {!isEditing && (
                      <Text style={{ marginTop: 8, color: colors.grayText, fontWeight: "800" }}>
                        {ACTIONS.filter((a) => actions?.[a.key]).map((a) => a.label).join(" • ") || "Aucune action"}
                      </Text>
                    )}

                    {/* edit actions */}
                    {isEditing && (
                      <View style={{ marginTop: 10 }}>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 as any }}>
                          {ACTIONS.map((a) => (
                            <View key={a.key} style={{ flexDirection: "row", alignItems: "center", gap: 8 as any, marginRight: 12, marginTop: 10 }}>
                              <Checkbox checked={!!actions?.[a.key]} onPress={() => toggleDraftAction(p.module, a.key)} />
                              <Text style={{ fontWeight: "800", color: "#111827" }}>{a.label}</Text>
                            </View>
                          ))}
                        </View>

                        <View style={{ flexDirection: isWide ? "row" : "column", gap: 10 as any, marginTop: 14 }}>
                          <View style={{ flex: 1 }}>
                            <Button
                              title={savingModule === p.module ? "Enregistrement..." : "Enregistrer"}
                              onPress={() => saveEdit(p.module)}
                              disabled={savingModule === p.module}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Button title="Annuler" variant="ghost" onPress={cancelEdit} />
                          </View>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* icons */}
                  <View style={{ flexDirection: "row", gap: 10 as any }}>
                    <Pressable
                      onPress={() => (isEditing ? cancelEdit() : startEdit(p.module))}
                      style={{ padding: 8 }}
                    >
                      <Text style={{ fontSize: 18 }}>✏️</Text>
                    </Pressable>
                    <Pressable onPress={() => onDelete(p.module)} style={{ padding: 8 }}>
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
