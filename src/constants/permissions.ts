// export type CrudAction = "read" | "create" | "update" | "delete";

// export type PermissionsMap = Record<string, Record<CrudAction, boolean>>;

// export const MODULES: { key: string; label: string }[] = [
//   { key: "orders", label: "Commandes" },
//   { key: "products", label: "Produits" },
//   { key: "categories", label: "Catégories" },
//   { key: "staff", label: "Personnel" },
//   { key: "shop", label: "Boutique" },
//   { key: "stats", label: "Statistiques" },
//   { key: "calculator", label: "Calculateur" },
//   { key: "manager", label: "Gestionnaire" },
// ];

// export const ACTIONS: { key: CrudAction; label: string }[] = [
//   { key: "read", label: "Lire" },
//   { key: "create", label: "Créer" },
//   { key: "update", label: "Modifier" },
//   { key: "delete", label: "Supprimer" },
// ];

// export const emptyPermissions = (): PermissionsMap => {
//   const obj: PermissionsMap = {};
//   MODULES.forEach((m) => {
//     obj[m.key] = { read: false, create: false, update: false, delete: false };
//   });
//   return obj;
// };
export type CrudAction = "read" | "create" | "update" | "delete";

export type UserPermission = {
  module: string;
  action: CrudAction;
};

export type PermissionModule = {
  _id?: string;
  module: string; // ex: "products"
  actions: Record<CrudAction, boolean>; // ex: {read:true, create:true...}
};
