// import api from "./api";
// import type { PermissionModule } from "../constants/permissions";

// export const getPermissionModules = async (): Promise<PermissionModule[]> => {
//   const res = await api.get("/permissions");
//   return res.data;
// };
import api from "./api";
import type { PermissionModule } from "../constants/permissions";

export const getPermissionModules = async (): Promise<PermissionModule[]> => {
  const res = await api.get("/permissions");
  return res.data;
};

export const createPermissionModule = async (
  module: string,
  actions: Record<string, boolean>,
) => {
  const res = await api.post("/permissions", { module, actions });
  return res.data as PermissionModule;
};

export const updatePermissionModule = async (
  module: string,
  actions: Record<string, boolean>,
) => {
  const res = await api.patch(`/permissions/${encodeURIComponent(module)}`, { actions });
  return res.data as PermissionModule;
};

export const deletePermissionModule = async (module: string) => {
  const res = await api.delete(`/permissions/${encodeURIComponent(module)}`);
  return res.data;
};
