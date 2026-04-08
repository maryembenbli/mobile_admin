import React, { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { setupAdminPassword } from "../services/auth.service";
import { getApiErrorMessage } from "../utils/api-error";
import { Button, Card, Input } from "../ui/atoms";
import { colors } from "../ui/theme";

export default function SetupPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const initialToken = useMemo(() => {
    if (Array.isArray(params.token)) {
      return params.token[0] || "";
    }

    return params.token || "";
  }, [params.token]);

  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [screenMessage, setScreenMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const onSubmit = async () => {
    if (!token.trim()) {
      setScreenMessage("Le lien d'activation est invalide ou incomplet.");
      return;
    }

    if (!password || !confirmPassword) {
      setScreenMessage("Veuillez remplir tous les champs avant de continuer.");
      return;
    }

    if (password !== confirmPassword) {
      setScreenMessage("Les deux mots de passe doivent etre identiques.");
      return;
    }

    setLoading(true);
    setScreenMessage("");
    setSuccessMessage("");
    try {
      await setupAdminPassword(token, password);
      setSuccessMessage("Mot de passe defini avec succes. Redirection vers la connexion...");
      setTimeout(() => {
        router.replace("/login");
      }, 1200);
    } catch (error: any) {
      setScreenMessage(getApiErrorMessage(error, "Impossible de definir le mot de passe."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.blue, colors.blue2]} style={{ flex: 1, padding: 16 }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View style={{ width: "100%", maxWidth: 520 }}>
          <Card style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: "900", color: colors.blue, textAlign: "center" }}>
              Activer le compte admin
            </Text>

            <Text style={{ marginTop: 10, color: colors.grayText, textAlign: "center", lineHeight: 22 }}>
              Definis un mot de passe personnel. Ce mot de passe restera prive et remplacera le lien
              d'activation a usage unique.
            </Text>

            {screenMessage ? (
              <View
                style={{
                  marginTop: 16,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "#FCA5A5",
                  backgroundColor: "#FEF2F2",
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                }}
              >
                <Text style={{ color: "#991B1B", fontWeight: "700", lineHeight: 20 }}>{screenMessage}</Text>
              </View>
            ) : null}

            {successMessage ? (
              <View
                style={{
                  marginTop: 16,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "#BBF7D0",
                  backgroundColor: "#F0FDF4",
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                }}
              >
                <Text style={{ color: "#166534", fontWeight: "700", lineHeight: 20 }}>{successMessage}</Text>
              </View>
            ) : null}

            <Text style={{ marginTop: 18, marginBottom: 8, color: colors.blue, fontWeight: "800" }}>
              Token d'activation
            </Text>
            <Input
              value={token}
              onChangeText={(value) => {
                setToken(value);
                if (screenMessage) setScreenMessage("");
              }}
              autoCapitalize="none"
              placeholder="Token d'activation"
            />

            <Text style={{ marginTop: 12, marginBottom: 8, color: colors.blue, fontWeight: "800" }}>
              Nouveau mot de passe
            </Text>
            <Input
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (screenMessage) setScreenMessage("");
              }}
              secureTextEntry
              placeholder="Au moins 8 caracteres, 1 majuscule, 1 minuscule, 1 chiffre"
            />

            <Text style={{ marginTop: 12, marginBottom: 8, color: colors.blue, fontWeight: "800" }}>
              Confirmer le mot de passe
            </Text>
            <Input
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                if (screenMessage) setScreenMessage("");
              }}
              secureTextEntry
              placeholder="Retape le mot de passe"
            />

            <View
              style={{
                marginTop: 14,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                backgroundColor: "#F8FAFC",
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <Text style={{ color: colors.grayText, lineHeight: 20 }}>
                Regles: 8 caracteres minimum, avec au moins une majuscule, une minuscule et un chiffre.
              </Text>
            </View>

            <View style={{ marginTop: 18 }}>
              <Button
                title={loading ? "Activation..." : "Definir mon mot de passe"}
                onPress={onSubmit}
                disabled={loading}
              />
            </View>
          </Card>
        </View>
      </View>
    </LinearGradient>
  );
}
