import api from './api';

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


export type AdminUser = {
  _id: string;
  email: string;
  isSuperAdmin: boolean;
  permissions: string[];
  createdAt?: string;
};

export const getAdmins = async (): Promise<AdminUser[]> => {
  const res = await api.get("/users/admins");
  return res.data;
};

export const deleteAdmin = async (id: string) => {
  const res = await api.delete(`/users/admins/${id}`);
  return res.data;
};

export const updateAdminPermissions = async (id: string, permissions: string[]) => {
  const res = await api.patch(`/users/admins/${id}/permissions`, { permissions });
  return res.data as AdminUser;
};

export const createAdmin = async (email: string, permissions: string[]) => {
  const res = await api.post("/auth/create-admin", { email, permissions });
  return res.data as { email: string; password: string };
};

