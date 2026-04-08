import React, { createContext, useContext } from "react";
import type { UserPermission } from "../constants/permissions";

export type AdminShellLocale = "fr" | "ar";

export type AdminShellUser = {
  sub: string;
  email?: string;
  isSuperAdmin?: boolean;
  permissions?: UserPermission[];
} | null;

type AdminShellContextValue = {
  locale: AdminShellLocale;
  setLocale: (locale: AdminShellLocale) => void;
  user: AdminShellUser;
};

const AdminShellContext = createContext<AdminShellContextValue | null>(null);

export function AdminShellProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: AdminShellContextValue;
}) {
  return <AdminShellContext.Provider value={value}>{children}</AdminShellContext.Provider>;
}

export function useAdminShell() {
  const context = useContext(AdminShellContext);
  if (!context) {
    throw new Error("useAdminShell must be used inside AdminShellProvider");
  }
  return context;
}
