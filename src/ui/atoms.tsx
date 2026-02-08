import React from "react";
import { View, Text, TextInput, Pressable, ViewStyle } from "react-native";
import { colors } from "./theme";

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
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

export function Input(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      {...props}
      style={[
        {
          borderWidth: 1,
          borderColor: "#D1D5DB",
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 12,
          backgroundColor: colors.white,
        },
        props.style,
      ]}
      placeholderTextColor="#9CA3AF"
    />
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
  variant?: "primary" | "orange" | "ghost";
  disabled?: boolean;
}) {
  const bg =
    variant === "primary" ? colors.blue : variant === "orange" ? colors.orange : "transparent";
  const text = variant === "ghost" ? colors.blue : colors.white;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: "center",
        backgroundColor: disabled ? "#BDBDBD" : bg,
        borderWidth: variant === "ghost" ? 0 : 0,
      }}
    >
      <Text style={{ color: text, fontWeight: "800" }}>{title}</Text>
    </Pressable>
  );
}
