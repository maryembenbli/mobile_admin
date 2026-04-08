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
  getAdmins,
  createAdmin,
  deleteAdmin,
  updateAdminPermissions,
  resendAdminInvite,
  type AdminInviteResponse,
  type AdminUser,
} from "../src/services/admins.service";
import { logout } from "../src/services/auth.service";
import PermissionsTable from "../src/components/PermissionsTable";
import { getPermissionModules } from "../src/services/permissions.service";
import type {
  PermissionModule,
  UserPermission,
  CrudAction,
} from "../src/constants/permissions";

function toast(title: string, message?: string) {
  if (Platform.OS === "web") {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }

  Alert.alert(title, message ?? "");
}

async function copyText(value: string) {
  if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(value);
    return true;
  }

  return false;
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
  create: "Creer",
  update: "Modifier",
  delete: "Supprimer",
};

const ACTIONS: CrudAction[] = ["read", "create", "update", "delete"];

function normalizeUserPerms(raw: any): UserPermission[] {
  if (Array.isArray(raw) && raw.some((x) => x === "*")) return [];

  if (Array.isArray(raw)) {
    return raw
      .filter(
        (x) =>
          x &&
          typeof x === "object" &&
          typeof x.module === "string" &&
          typeof x.action === "string",
      )
      .map((x) => ({ module: x.module, action: x.action as CrudAction }));
  }

  if (raw && typeof raw === "object") {
    const out: UserPermission[] = [];
    for (const module of Object.keys(raw)) {
      const row = raw[module];
      if (!row || typeof row !== "object") continue;
      ACTIONS.forEach((action) => {
        if (row[action] === true) out.push({ module, action });
      });
    }
    return out;
  }

  return [];
}

function buildSummary(modules: PermissionModule[], userPerms: UserPermission[]) {
  const out: string[] = [];
  modules.forEach((moduleDef) => {
    const actions = userPerms
      .filter((permission) => permission.module === moduleDef.module)
      .map((permission) => ACTION_LABEL[permission.action])
      .sort();

    if (actions.length) {
      out.push(`${moduleDef.module}: ${actions.join(", ")}`);
    }
  });
  return out;
}

function InviteCard({
  inviteInfo,
  isWide,
  onCopy,
  onClose,
}: {
  inviteInfo: AdminInviteResponse;
  isWide: boolean;
  onCopy: () => void;
  onClose: () => void;
}) {
  return (
    <Card style={{ marginBottom: 14, backgroundColor: "#F8FAFC" }}>
      <Text style={{ fontSize: 18, fontWeight: "900", color: colors.navy }}>
        Invitation admin prete
      </Text>

      <Text style={{ marginTop: 10, color: colors.grayText, lineHeight: 22 }}>
        En conditions reelles, on envoie uniquement ce lien d&apos;activation a l&apos;admin. Il definit
        lui-meme son mot de passe prive, donc personne d&apos;autre ne le connait.
      </Text>

      <View
        style={{
          marginTop: 12,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: inviteInfo.emailSent ? "#BBF7D0" : "#FDE68A",
          backgroundColor: inviteInfo.emailSent ? "#F0FDF4" : "#FFFBEB",
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      >
        <Text
          style={{
            color: inviteInfo.emailSent ? "#166534" : "#92400E",
            fontWeight: "700",
            lineHeight: 20,
          }}
        >
          {inviteInfo.emailSent
            ? "Email d'activation envoye automatiquement. Tu peux aussi copier le lien ci-dessous si besoin."
            : "Aucun envoi automatique detecte. Copie ce lien et envoie-le manuellement a l'admin."}
        </Text>
      </View>

      <Text style={{ marginTop: 12, marginBottom: 6, fontWeight: "800", color: colors.navy }}>Email</Text>
      <Input value={inviteInfo.email} editable={false} />

      <Text style={{ marginTop: 12, marginBottom: 6, fontWeight: "800", color: colors.navy }}>
        Lien d&apos;activation
      </Text>
      <Input value={inviteInfo.setupUrl} editable={false} />

      <Text style={{ marginTop: 10, color: colors.grayText, fontWeight: "700" }}>
        Expire le: {new Date(inviteInfo.expiresAt).toLocaleString()}
      </Text>

      <View style={{ flexDirection: isWide ? "row" : "column", gap: 10 as any, marginTop: 14 }}>
        <View style={{ flex: 1 }}>
          <Button title="Copier le lien" onPress={onCopy} />
        </View>
        <View style={{ flex: 1 }}>
          <Button title="Fermer" variant="ghost" onPress={onClose} />
        </View>
      </View>
    </Card>
  );
}

export default function AdminsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [permissionModules, setPermissionModules] = useState<PermissionModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPerms, setLoadingPerms] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [email, setEmail] = useState("");
  const [createPerms, setCreatePerms] = useState<UserPermission[]>([]);
  const [creating, setCreating] = useState(false);
  const [inviteInfo, setInviteInfo] = useState<AdminInviteResponse | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftPerms, setDraftPerms] = useState<Record<string, UserPermission[]>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);

  const title = useMemo(() => "Gestion des administrateurs", []);

  const loadPermModules = async () => {
    setLoadingPerms(true);
    try {
      const modules = await getPermissionModules();
      modules.sort((a, b) => a.module.localeCompare(b.module));
      setPermissionModules(modules);
    } catch {
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
      list.forEach((admin) => {
        map[admin._id] = normalizeUserPerms((admin as any).permissions);
      });
      setDraftPerms(map);
    } catch (error: any) {
      if (error?.response?.status === 401) {
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
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return toast("Erreur", "Email obligatoire");
    if (!normalizedEmail.includes("@")) return toast("Erreur", "Email invalide");
    if (createPerms.length === 0) return toast("Erreur", "Choisis au moins une permission");

    setCreating(true);
    try {
      const result = await createAdmin(normalizedEmail, createPerms);
      setInviteInfo(result);
      setEmail("");
      setCreatePerms([]);
      setShowCreate(false);
      await loadAdmins();
      toast(
        "Admin cree",
        result.emailSent
          ? "Le compte est en attente d'activation et l'email a ete envoye."
          : "Le compte est en attente d'activation. Envoie maintenant le lien securise.",
      );
    } catch (error: any) {
      if (error?.response?.status === 401) {
        await logout();
        router.replace("/login");
        return;
      }

      const message = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message.join("\n")
        : error?.response?.data?.message;
      toast("Erreur", message || "Creation admin impossible");
    } finally {
      setCreating(false);
    }
  };

  const onResendInvite = async (adminEmail: string) => {
    setResendingEmail(adminEmail);
    try {
      const result = await resendAdminInvite(adminEmail);
      setInviteInfo(result);
      await loadAdmins();
      toast(
        "Lien regenere",
        result.emailSent
          ? "Le nouveau lien a ete envoye automatiquement."
          : "Le nouveau lien d'activation est pret a etre partage.",
      );
    } catch (error: any) {
      if (error?.response?.status === 401) {
        await logout();
        router.replace("/login");
        return;
      }

      const message = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message.join("\n")
        : error?.response?.data?.message;
      toast("Erreur", message || "Impossible de regenerer le lien");
    } finally {
      setResendingEmail(null);
    }
  };

  const onCopyInvite = async () => {
    if (!inviteInfo) return;
    const copied = await copyText(inviteInfo.setupUrl);
    if (copied) {
      toast("Lien copie", "Le lien d'activation a ete copie dans le presse-papiers.");
      return;
    }

    toast("Lien d'activation", inviteInfo.setupUrl);
  };

  const startEdit = (id: string) => {
    setEditingId(id);
    setDraftPerms((prev) => ({ ...prev, [id]: prev[id] || [] }));
  };

  const cancelEdit = () => {
    const map: Record<string, UserPermission[]> = {};
    admins.forEach((admin) => {
      map[admin._id] = normalizeUserPerms((admin as any).permissions);
    });
    setDraftPerms(map);
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    const permissions = draftPerms[id] || [];
    setSavingId(id);
    try {
      await updateAdminPermissions(id, permissions);
      setEditingId(null);
      await loadAdmins();
      toast("OK", "Permissions mises a jour");
    } catch (error: any) {
      if (error?.response?.status === 401) {
        await logout();
        router.replace("/login");
        return;
      }
      toast("Erreur", error?.response?.data?.message || "Update permissions impossible");
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
    } catch (error: any) {
      if (error?.response?.status === 401) {
        await logout();
        router.replace("/login");
        return;
      }
      toast("Erreur", "Suppression impossible");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
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
            <Badge label="EQUIPE NOVIKA" tone="blue" />
            <View style={{ marginTop: 10 }}>
              <SectionTitle
                title={title}
                subtitle="Invitations, activation et permissions dans un espace organise comme un vrai backoffice e-commerce."
              />
            </View>
          </View>

          <View style={{ width: isWide ? 220 : "100%" }}>
            <Button
              title={showCreate ? "Fermer" : "Ajouter Admin"}
              variant="orange"
              onPress={() => setShowCreate((value) => !value)}
            />
          </View>
        </View>

        {showCreate && (
          <Card style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 18, fontWeight: "900", color: colors.navy }}>
              Nouvel Administrateur
            </Text>
            <Text style={{ color: colors.grayText, marginTop: 6 }}>
              Cree un compte equipe, choisis ses acces et envoie-lui un lien d&apos;activation securise.
            </Text>

            <Text style={{ marginTop: 12, marginBottom: 6, fontWeight: "800", color: colors.navy }}>Email</Text>
            <Input
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="email@exemple.com"
            />

            <Text style={{ marginTop: 12, marginBottom: 8, fontWeight: "800", color: colors.navy }}>
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
              <Button title={creating ? "Creation..." : "Creer"} onPress={onCreate} disabled={creating} />
            </View>
          </Card>
        )}

        {inviteInfo ? (
          <InviteCard
            inviteInfo={inviteInfo}
            isWide={isWide}
            onCopy={onCopyInvite}
            onClose={() => setInviteInfo(null)}
          />
        ) : null}

        {loading ? (
          <View style={{ padding: 20 }}>
            <ActivityIndicator />
            <Text style={{ textAlign: "center", marginTop: 10 }}>Chargement...</Text>
          </View>
        ) : (
          admins.map((admin) => {
            const isEditing = editingId === admin._id;
            const userPerms = normalizeUserPerms((admin as any).permissions);
            const summary = buildSummary(permissionModules, userPerms);
            const editValue = draftPerms[admin._id] || userPerms;

            return (
              <Card key={admin._id} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: "900", color: colors.navy }}>
                      {admin.isSuperAdmin ? "Admin Principal" : "Admin Support"}
                    </Text>
                    <Text style={{ color: colors.grayText, marginTop: 2 }}>{admin.email}</Text>

                    {!admin.isSuperAdmin && admin.passwordSetupRequired ? (
                      <View
                        style={{
                          marginTop: 10,
                          alignSelf: "flex-start",
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 999,
                          backgroundColor: "#FFFBEB",
                          borderWidth: 1,
                          borderColor: "#FDE68A",
                        }}
                      >
                        <Text style={{ color: "#92400E", fontWeight: "800", fontSize: 12 }}>
                          Activation en attente
                        </Text>
                      </View>
                    ) : null}

                    {!admin.isSuperAdmin && !isEditing ? (
                      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 6 }}>
                        {summary.length === 0 ? (
                          <Text style={{ marginTop: 10, color: "#9CA3AF", fontWeight: "700" }}>
                            Aucune permission
                          </Text>
                        ) : (
                          summary.map((line) => <SummaryChip key={line} label={line} />)
                        )}
                      </View>
                    ) : null}

                    {!admin.isSuperAdmin && admin.passwordSetupRequired ? (
                      <View style={{ marginTop: 12 }}>
                        <Text style={{ color: colors.grayText, fontWeight: "700" }}>
                          Lien actif jusqu&apos;au:{" "}
                          {admin.passwordSetupExpires
                            ? new Date(admin.passwordSetupExpires).toLocaleString()
                            : "non disponible"}
                        </Text>
                        <View style={{ marginTop: 10, width: isWide ? 220 : "100%" }}>
                          <Button
                            title={
                              resendingEmail === admin.email ? "Regeneration..." : "Regenerer le lien"
                            }
                            variant="ghost"
                            onPress={() => onResendInvite(admin.email)}
                            disabled={resendingEmail === admin.email}
                          />
                        </View>
                      </View>
                    ) : null}

                    {!admin.isSuperAdmin && isEditing ? (
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
                                [admin._id]: next,
                              }))
                            }
                            editable
                          />
                        )}

                        <View style={{ flexDirection: isWide ? "row" : "column", gap: 10 as any, marginTop: 14 }}>
                          <View style={{ flex: 1 }}>
                            <Button
                              title={savingId === admin._id ? "Enregistrement..." : "Enregistrer"}
                              onPress={() => saveEdit(admin._id)}
                              disabled={savingId === admin._id}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Button title="Annuler" variant="ghost" onPress={cancelEdit} />
                          </View>
                        </View>
                      </View>
                    ) : null}

                    {admin.isSuperAdmin ? (
                      <Text style={{ marginTop: 10, color: "#6B7280", fontWeight: "800" }}>Permissions: *</Text>
                    ) : null}
                  </View>

                  {!admin.isSuperAdmin ? (
                    <View style={{ flexDirection: "row", gap: 10 as any }}>
                      <Pressable
                        onPress={() => (isEditing ? cancelEdit() : startEdit(admin._id))}
                        style={{ padding: 8 }}
                      >
                        <Text style={{ fontSize: 18 }}>Edit</Text>
                      </Pressable>
                      <Pressable onPress={() => onDelete(admin._id)} style={{ padding: 8 }}>
                        <Text style={{ fontSize: 18 }}>Delete</Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
