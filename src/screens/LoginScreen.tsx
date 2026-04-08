import React, { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { consumeLogoutReason, login } from "../services/auth.service";
import { getApiErrorMessage } from "../utils/api-error";
import { Badge, Button, Card, Input } from "../ui/atoms";
import { colors } from "../ui/theme";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionMessage, setSessionMessage] = useState("");
  const [loginMessage, setLoginMessage] = useState("");

  useEffect(() => {
    const loadReason = async () => {
      const reason = await consumeLogoutReason();
      if (reason === "SESSION_EXPIRED") {
        setSessionMessage("Votre session a expire. Reconnectez-vous pour continuer.");
      }
    };

    loadReason();
  }, []);

  const onLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Erreur", "Veuillez remplir tous les champs");
    }

    setLoading(true);
    setLoginMessage("");
    try {
      await login(email.trim(), password);
      router.replace("/dashboard");
    } catch (error: any) {
      console.error(error);
      const status = error?.response?.status;
      const data = error?.response?.data;

      if (status === 403 && data?.code === "PASSWORD_SETUP_REQUIRED") {
        setLoginMessage(
          "Ce compte n'est pas encore active. Ouvre d'abord le lien d'activation envoye par le super admin pour definir ton mot de passe.",
        );
        return;
      }

      if (status === 401) {
        setLoginMessage("Email ou mot de passe incorrect. Verifie tes identifiants puis reessaie.");
        return;
      }

      setLoginMessage(getApiErrorMessage(error, "Connexion impossible pour le moment."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.navy, colors.navySoft]} style={{ flex: 1, padding: 18 }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View style={{ width: "100%", maxWidth: 460 }}>
          <View style={{ alignItems: "center", marginBottom: 22 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 24,
                backgroundColor: colors.orange,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <Text style={{ color: "white", fontSize: 22, fontWeight: "900" }}>NV</Text>
            </View>
            <Badge label="NOVIKA ADMIN" tone="orange" />
            <Text style={{ fontSize: 32, color: "white", fontWeight: "900", marginTop: 14 }}>NOVIKA</Text>
            <Text style={{ color: "#BFDBFE", marginTop: 6, textAlign: "center" }}>
              Backoffice e-commerce unifie, moderne et pense pour l'equipe.
            </Text>
          </View>

          <Card style={{ padding: 22 }}>
            <Text style={{ fontSize: 24, fontWeight: "900", color: colors.navy, textAlign: "center" }}>
              Connexion
            </Text>
            <Text style={{ color: colors.grayText, textAlign: "center", marginTop: 6 }}>
              Entrez vos acces pour ouvrir l'espace de gestion NOVIKA.
            </Text>

            {sessionMessage ? (
              <View
                style={{
                  marginTop: 14,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "#FDE68A",
                  backgroundColor: "#FFFBEB",
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                }}
              >
                <Text style={{ color: "#92400E", fontWeight: "700" }}>{sessionMessage}</Text>
              </View>
            ) : null}

            {loginMessage ? (
              <View
                style={{
                  marginTop: 14,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "#BFDBFE",
                  backgroundColor: "#EFF6FF",
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                }}
              >
                <Text style={{ color: colors.cobalt, fontWeight: "700", lineHeight: 20 }}>{loginMessage}</Text>
              </View>
            ) : null}

            <Text style={{ marginTop: 18, marginBottom: 8, color: colors.navy, fontWeight: "800" }}>
              Adresse email
            </Text>
            <Input
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="email@exemple.com"
            />

            <Text style={{ marginTop: 14, marginBottom: 8, color: colors.navy, fontWeight: "800" }}>
              Mot de passe
            </Text>
            <Input value={password} onChangeText={setPassword} secureTextEntry placeholder="********" />

            <View style={{ marginTop: 14 }}>
              <Button title={loading ? "Connexion..." : "Se connecter"} onPress={onLogin} disabled={loading} />
            </View>
          </Card>
        </View>
      </View>
    </LinearGradient>
  );
}
