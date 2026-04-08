import React from "react";
import { Platform, Pressable, Text, TextInput, View, ViewStyle } from "react-native";
import { colors, radii, shadows } from "./theme";

export function Card({
  children,
  style,
  tone = "default",
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  tone?: "default" | "muted";
}) {
  return (
    <View
      style={[
        {
          backgroundColor: tone === "muted" ? colors.bgMuted : colors.white,
          borderRadius: radii.lg,
          padding: 18,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
          ...(shadows.card as ViewStyle),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: "900" }}>{title}</Text>
      {subtitle ? <Text style={{ color: colors.grayText, marginTop: 5, lineHeight: 20 }}>{subtitle}</Text> : null}
    </View>
  );
}

export function Input(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      {...props}
      style={[
        {
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.md,
          paddingHorizontal: 14,
          paddingVertical: 14,
          backgroundColor: colors.white,
          color: colors.text,
          fontSize: 15,
        },
        props.style,
      ]}
      placeholderTextColor="#94A3B8"
    />
  );
}

export function Badge({
  label,
  tone = "blue",
}: {
  label: string;
  tone?: "blue" | "orange" | "green" | "violet" | "muted";
}) {
  const palette =
    tone === "orange"
      ? { bg: colors.orangeSoft, text: colors.orange }
      : tone === "green"
        ? { bg: colors.greenSoft, text: colors.green }
        : tone === "violet"
          ? { bg: colors.violetSoft, text: colors.violet }
          : tone === "muted"
            ? { bg: colors.bgMuted, text: colors.grayText }
            : { bg: colors.cobaltSoft, text: colors.cobalt };

  return (
    <View
      style={{
        alignSelf: "flex-start",
        borderRadius: radii.pill,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: palette.bg,
      }}
    >
      <Text style={{ color: palette.text, fontWeight: "900", fontSize: 12 }}>{label}</Text>
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "orange" | "ghost" | "secondary";
  disabled?: boolean;
}) {
  const palette =
    variant === "orange"
      ? { bg: colors.orange, text: colors.white, border: colors.orange }
      : variant === "ghost"
        ? { bg: colors.white, text: colors.text, border: colors.border }
        : variant === "secondary"
          ? { bg: colors.navy, text: colors.white, border: colors.navy }
          : { bg: colors.cobalt, text: colors.white, border: colors.cobalt };

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      hitSlop={10}
      style={({ pressed }) =>
        ({
          borderRadius: radii.md,
          paddingVertical: 14,
          paddingHorizontal: 16,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: disabled ? "#CBD5E1" : palette.bg,
          borderWidth: 1,
          borderColor: disabled ? "#CBD5E1" : palette.border,
          opacity: pressed ? 0.9 : 1,
          ...(Platform.OS === "web" ? ({ cursor: disabled ? "not-allowed" : "pointer" } as any) : {}),
        }) as any
      }
    >
      <Text style={{ color: palette.text, fontWeight: "900", fontSize: 15 }}>{title}</Text>
    </Pressable>
  );
}

