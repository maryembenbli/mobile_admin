

/*export const getAdmins = async () => {
  const res = await api.get('/users/admins');
  return res.data;
};

export const deleteAdmin = async (id) => {
  const res = await api.delete(`/users/admins/${id}`);
  return res.data;
};

export const updateAdminPermissions = async (id, permissions) => {
  const res = await api.patch(`/users/admins/${id}/permissions`, { permissions });
  return res.data;
};

export const createAdmin = async (email, permissions) => {
  const res = await api.post('/auth/create-admin', { email, permissions });
  return res.data; // { email, password }
};*/


// export type AdminUser = {
//   _id: string;
//   email: string;
//   isSuperAdmin: boolean;
//   permissions: string[];
//   createdAt?: string;
// };

// export const getAdmins = async (): Promise<AdminUser[]> => {
//   const res = await api.get("/users/admins");
//   return res.data;
// };

// export const deleteAdmin = async (id: string) => {
//   const res = await api.delete(`/users/admins/${id}`);
//   return res.data;
// };

// export const updateAdminPermissions = async (id: string, permissions: string[]) => {
//   const res = await api.patch(`/users/admins/${id}/permissions`, { permissions });
//   return res.data as AdminUser;
// };

// export const createAdmin = async (email: string, permissions: string[]) => {
//   const res = await api.post("/auth/create-admin", { email, permissions });
//   return res.data as { email: string; password: string };
// };


//16/02
// import api from "./api";
// import type { PermissionsMap } from "../constants/permissions";

// export type AdminUser = {
//   _id: string;
//   email: string;
//   isSuperAdmin: boolean;
//   permissions: PermissionsMap;  // ✅ plus string[]
//   createdAt?: string;
// };

// export const getAdmins = async (): Promise<AdminUser[]> => {
//   const res = await api.get("/users/admins");
//   return res.data;
// };

// export const deleteAdmin = async (id: string) => {
//   const res = await api.delete(`/users/admins/${id}`);
//   return res.data;
// };

// export const updateAdminPermissions = async (id: string, permissions: PermissionsMap) => {
//   const res = await api.patch(`/users/admins/${id}/permissions`, { permissions }); // ✅ object
//   return res.data as AdminUser;
// };

// export const createAdmin = async (email: string, permissions: PermissionsMap) => {
//   const res = await api.post("/auth/create-admin", { email, permissions }); // ✅ object
//   return res.data as { email: string; password: string };
// };
import api from "./api";
import type { UserPermission } from "../constants/permissions";

export type AdminUser = {
  _id: string;
  email: string;
  isSuperAdmin: boolean;
  permissions: UserPermission[];
  createdAt?: string;
  passwordSetupRequired?: boolean;
  passwordSetupExpires?: string;
};

export type AdminInviteResponse = {
  email: string;
  setupUrl: string;
  expiresAt: string;
  passwordSetupRequired: boolean;
  emailSent?: boolean;
};

export const getAdmins = async (): Promise<AdminUser[]> => {
  const res = await api.get("/users/admins");
  return res.data;
};

export const deleteAdmin = async (id: string) => {
  const res = await api.delete(`/users/admins/${id}`);
  return res.data;
};

export const updateAdminPermissions = async (id: string, permissions: UserPermission[]) => {
  const res = await api.patch(`/users/admins/${id}/permissions`, { permissions });
  return res.data as AdminUser;
};

export const createAdmin = async (email: string, permissions: UserPermission[]) => {
  const res = await api.post("/auth/create-admin", { email, permissions });
  return res.data as AdminInviteResponse;
};

export const resendAdminInvite = async (email: string) => {
  const res = await api.post("/auth/resend-admin-invite", { email });
  return res.data as AdminInviteResponse;
};
