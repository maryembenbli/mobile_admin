import React from "react";
import { View, Text, Pressable } from "react-native";
import { colors } from "../ui/theme";
import type { CrudAction, PermissionModule, UserPermission } from "../constants/permissions";

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

const has = (value: UserPermission[], module: string, action: CrudAction) =>
  value.some((p) => p.module === module && p.action === action);

const toggle = (value: UserPermission[], module: string, action: CrudAction) => {
  const exists = has(value, module, action);
  if (exists) return value.filter((p) => !(p.module === module && p.action === action));
  return [...value, { module, action }];
};

export default function PermissionsTable({
  modules,
  value,
  onChange,
  editable = true,
}: {
  modules: PermissionModule[];
  value: UserPermission[];
  onChange: (next: UserPermission[]) => void;
  editable?: boolean;
}) {
  const setCell = (moduleKey: string, action: CrudAction) => {
    onChange(toggle(value, moduleKey, action));
  };

  const rowAllChecked = (m: PermissionModule) =>
    ACTIONS.every((a) => has(value, m.module, a.key));

  const setRowAll = (m: PermissionModule, checked: boolean) => {
    let next = [...value];
    ACTIONS.forEach((a) => {
      const allowed = m.actions?.[a.key] !== false; // si backend met false => disabled
      if (!allowed) return;

      const exists = has(next, m.module, a.key);
      if (checked && !exists) next.push({ module: m.module, action: a.key });
      if (!checked && exists) next = next.filter((p) => !(p.module === m.module && p.action === a.key));
    });
    onChange(next);
  };

  const allChecked = () =>
    modules.every((m) =>
      ACTIONS.every((a) => {
        const allowed = m.actions?.[a.key] !== false;
        return !allowed || has(value, m.module, a.key);
      }),
    );

  const setAll = (checked: boolean) => {
    let next: UserPermission[] = checked ? [] : [...value];

    if (checked) {
      modules.forEach((m) => {
        ACTIONS.forEach((a) => {
          const allowed = m.actions?.[a.key] !== false;
          if (allowed) next.push({ module: m.module, action: a.key });
        });
      });
      onChange(next);
      return;
    }

    // unchecked all
    const toRemove = new Set<string>();
    modules.forEach((m) => ACTIONS.forEach((a) => toRemove.add(`${m.module}:${a.key}`)));
    next = next.filter((p) => !toRemove.has(`${p.module}:${p.action}`));
    onChange(next);
  };

  return (
    <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: "hidden" }}>
      {/* Header */}
      <View style={{ flexDirection: "row", padding: 10, backgroundColor: "#F8FAFC", borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Text style={{ flex: 1.4, fontWeight: "900", color: colors.grayText }}>Menu</Text>

        {ACTIONS.map((a) => (
          <Text key={a.key} style={{ flex: 1, fontWeight: "900", color: colors.grayText, textAlign: "center" }}>
            {a.label}
          </Text>
        ))}

        <View style={{ width: 70, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontWeight: "900", color: colors.grayText }}>Tous</Text>
        </View>

        <View style={{ width: 70, alignItems: "center", justifyContent: "center" }}>
          <Checkbox checked={allChecked()} disabled={!editable} onPress={() => setAll(!allChecked())} />
        </View>
      </View>

      {/* Rows */}
      {modules.map((m) => (
        <View
          key={m.module}
          style={{
            flexDirection: "row",
            paddingVertical: 10,
            paddingHorizontal: 10,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: "white",
          }}
        >
          <Text style={{ flex: 1.4, color: "#111827", fontWeight: "800" }}>{m.module}</Text>

          {ACTIONS.map((a) => {
            const allowed = m.actions?.[a.key] !== false;
            const checked = allowed ? has(value, m.module, a.key) : false;
            return (
              <View key={a.key} style={{ flex: 1, alignItems: "center" }}>
                <Checkbox
                  checked={checked}
                  disabled={!editable || !allowed}
                  onPress={() => setCell(m.module, a.key)}
                />
              </View>
            );
          })}

          <View style={{ width: 70, alignItems: "center", justifyContent: "center" }}>
            <Checkbox
              checked={rowAllChecked(m)}
              disabled={!editable}
              onPress={() => setRowAll(m, !rowAllChecked(m))}
            />
          </View>

          <View style={{ width: 70 }} />
        </View>
      ))}
    </View>
  );
}
