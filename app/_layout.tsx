import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Slot, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect, useMemo, useState } from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";
import AdminAppShell from "../src/components/AdminAppShell";
import { AdminShellProvider, type AdminShellLocale } from "../src/context/AdminShellContext";
import { getStoredUser, logout } from "../src/services/auth.service";

const PUBLIC_ROUTES = ["/", "/login", "/forgot-password", "/reset-password", "/setup-password"];

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const router = useRouter();
  const [locale, setLocale] = useState<AdminShellLocale>("fr");
  const [user, setUser] = useState<any>(null);

  const shouldUseShell = useMemo(
    () => !PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`)),
    [pathname],
  );

  useEffect(() => {
    let active = true;

    const loadStoredUser = async () => {
      try {
        const storedUser = await getStoredUser();
        if (active) {
          setUser(storedUser);
        }
      } catch {
        if (active) {
          setUser(null);
        }
      }
    };

    loadStoredUser();

    return () => {
      active = false;
    };
  }, [pathname]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AdminShellProvider value={{ locale, setLocale, user }}>
        {shouldUseShell ? (
          <AdminAppShell
            pathname={pathname}
            locale={locale}
            setLocale={setLocale}
            user={user}
            onLogout={async () => {
              await logout();
              setUser(null);
              router.replace("/login");
            }}
          >
            <Slot />
          </AdminAppShell>
        ) : (
          <Slot />
        )}
      </AdminShellProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
