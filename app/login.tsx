import LoginScreen from '../src/screens/LoginScreen';
export default function Login() {
  return <LoginScreen />;
}

/*import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { colors } from "../src/ui/theme";
import { Card, Input, Button } from "../src/ui/atoms";
import { login } from "../src/services/auth.service";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !password) return Alert.alert("Erreur", "Veuillez remplir tous les champs");

    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/dashboard");
    } catch {
      Alert.alert("Erreur", "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.blue, colors.blue2]} style={{ flex: 1, padding: 16 }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View style={{ width: "100%", maxWidth: 420 }}>
          <View style={{ alignItems: "center", marginBottom: 18 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                backgroundColor: colors.orange,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text style={{ color: "white", fontSize: 22, fontWeight: "900" }}>🛍️</Text>
            </View>
            <Text style={{ fontSize: 28, color: "white", fontWeight: "900" }}>E-Commerce Pro</Text>
            <Text style={{ color: "#BFDBFE", marginTop: 4 }}>Plateforme de gestion multicanal</Text>
          </View>

          <Card style={{ padding: 18 }}>
            <Text style={{ fontSize: 20, fontWeight: "900", color: colors.blue, textAlign: "center" }}>
              Connexion
            </Text>

            <Text style={{ marginTop: 16, marginBottom: 8, color: colors.blue, fontWeight: "800" }}>
              Adresse email
            </Text>
            <Input value={email} onChangeText={setEmail} autoCapitalize="none" placeholder="email@exemple.com" />

            <Text style={{ marginTop: 12, marginBottom: 8, color: colors.blue, fontWeight: "800" }}>
              Mot de passe
            </Text>
            <Input value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />

            <View style={{ marginTop: 14 }}>
              <Button title={loading ? "Connexion..." : "Se connecter"} onPress={onLogin} disabled={loading} />
            </View>

            <Text style={{ marginTop: 12, color: colors.orange, fontWeight: "700" }}>
              Mot de passe oublié ? (on fera screen بعد)
            </Text>
          </Card>
        </View>
      </View>
    </LinearGradient>
  );
}

*/