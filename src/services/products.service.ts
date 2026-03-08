// import api from "./api";
// import type { Product, ProductPayload } from "../types/product";

// // export type ImageFile = { uri: string; name?: string; type?: string };
// export type ImageFile = { uri: string; name?: string; type?: string; file?: File };

// // ✅ WEB helper: uri -> File
// async function uriToFile(uri: string, filename: string, mimeType: string) {
//   const res = await fetch(uri);
//   const blob = await res.blob();
//   return new File([blob], filename, { type: mimeType });
// }

// // ✅ Convert any value to number (or undefined)
// function toNumberOrUndef(v: any): number | undefined {
//   if (v === "" || v === null || v === undefined) return undefined;
//   const n = Number(String(v).replace(",", "."));
//   return Number.isFinite(n) ? n : undefined;
// }

// // ✅ Ensure array of strings
// function toStringArray(v: any): string[] {
//   if (!v) return [];
//   if (Array.isArray(v)) return v.map((x) => String(x)).filter(Boolean);
//   if (typeof v === "string") {
//     // allows comma separated input
//     return v
//       .split(",")
//       .map((x) => x.trim())
//       .filter(Boolean);
//   }
//   return [];
// }



// async function toProductFormData(payload: ProductPayload, images: ImageFile[] = []) {
//   const fd = new FormData();

//   // --- Normalize payload ---
//   const normalized: ProductPayload = {
//     ...payload,
//     name: payload.name?.trim() || "",
//     slug: payload.slug?.trim() || undefined,
//     sku: payload.sku?.trim() || undefined,
//     description: payload.description || undefined,
//     status: payload.status || undefined,
//     price: toNumberOrUndef((payload as any).price),
//     oldPrice: toNumberOrUndef((payload as any).oldPrice),
//     cost: toNumberOrUndef((payload as any).cost),
//     stock: toNumberOrUndef((payload as any).stock),
//     categories: toStringArray((payload as any).categories), // ✅ always array of strings
//   };

//   // ✅ append normal fields
//   Object.entries(normalized).forEach(([key, value]) => {
//     if (value === undefined || value === null) return;

//     if (key === "categories") return; // handled below
//     fd.append(key, String(value));
//   });

//   // ✅ IMPORTANT: send categories as array (repeat key)
//   const cats = normalized.categories ?? [];
//   cats.forEach((c) => fd.append("categories", String(c)));
//   // (si ton backend attend "categories[]" au lieu de "categories", change la ligne en:)
//   // cats.forEach((c) => fd.append("categories[]", String(c)));

//   // --- append images ---
//  // --- append images ---
// for (let i = 0; i < (images?.length || 0); i++) {
//   const img = images[i];
//   const name = img.name ?? `image_${Date.now()}_${i}.jpg`;
//   const type = img.type ?? "image/jpeg";

//   if (typeof File !== "undefined") {
//     // ✅ WEB: use the real File (most important)
//     if (img.file) {
//       fd.append("images", img.file, img.file.name);
//     } else {
//       const file = await uriToFile(img.uri, name, type);
//       fd.append("images", file);
//     }
//   } else {
//     fd.append("images", { uri: img.uri, name, type } as any);
//   }
// }
// console.log("IMAGES COUNT:", images.length);
// (images as any).forEach((im: any, idx: number) =>
//   console.log("IMG", idx, { hasFile: !!im.file, name: im.name, uri: im.uri?.slice(0, 30) })
// );
// (fd as any).forEach((v: any, k: any) => console.log("FD", k, v));
// console.log("IMAGES:", images.map((i:any)=>({name:i.name, hasFile:!!i.file, uri:i.uri?.slice(0,30)})));
// (fd as any).forEach((v:any,k:any)=>console.log("FD",k,v));
//   return fd;
// }

// // ===================== API =====================

// export async function getProducts(): Promise<Product[]> {
//   const { data } = await api.get("/products");
//   return data as Product[];
// }

// export async function getProduct(id: string): Promise<Product> {
//   const { data } = await api.get(`/products/${id}`);
//   return data as Product;
// }
// export async function createProduct(payload: ProductPayload, images: ImageFile[] = []) {
//   // ✅ No images => send JSON (like Postman) => backend validation OK
//   if (!images.length) {
//     const { data } = await api.post("/products", payload);
//     return data as Product;
//   }

//   // ✅ With images => multipart
//   const fd = await toProductFormData(payload, images);
//   const { data } = await api.post("/products", fd);
//   return data as Product;
// }

// export async function updateProduct(id: string, payload: ProductPayload, images: ImageFile[] = []) {
//   // ✅ No images => send JSON
//   if (!images.length) {
//     const { data } = await api.patch(`/products/${id}`, payload);
//     return data as Product;
//   }

//   // ✅ With images => multipart
//   const fd = await toProductFormData(payload, images);
//   const { data } = await api.patch(`/products/${id}`, fd);
//   return data as Product;
// }
// export async function deleteProduct(id: string) {
//   const { data } = await api.delete(`/products/${id}`);
//   return data as { message: string };
// }

import api from "./api";
import type { Product, ProductPayload } from "../types/product";

export type ImageFile = { uri: string; name?: string; type?: string; file?: File };

// helper: convert uri->File (fallback فقط)
async function uriToFile(uri: string, filename: string, mimeType: string) {
  const res = await fetch(uri);
  const blob = await res.blob();
  return new File([blob], filename, { type: mimeType });
}

function toNumberOrUndef(v: any): number | undefined {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

function toStringArray(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map((x) => String(x)).filter(Boolean);
  if (typeof v === "string") return v.split(",").map((x) => x.trim()).filter(Boolean);
  return [];
}

async function toProductFormData(payload: ProductPayload, images: ImageFile[] = []) {
  const fd = new FormData();

  const normalized: ProductPayload = {
    ...payload,
    name: payload.name?.trim() || "",
    slug: payload.slug?.trim() || undefined,
    sku: payload.sku?.trim() || undefined,
    description: payload.description || undefined,
    status: payload.status || undefined,
    price: toNumberOrUndef((payload as any).price),
    oldPrice: toNumberOrUndef((payload as any).oldPrice),
    cost: toNumberOrUndef((payload as any).cost),
    stock: toNumberOrUndef((payload as any).stock),
    categories: toStringArray((payload as any).categories),
  };

  // fields
  Object.entries(normalized).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === "categories") return;
    fd.append(key, String(value));
  });

  // categories as repeated keys (مثل Postman)
  (normalized.categories ?? []).forEach((c) => fd.append("categories", String(c)));

  // images
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const name = img.name ?? `image_${Date.now()}_${i}.jpg`;
    const type = img.type ?? "image/jpeg";

    // WEB: لازم File حقيقي
    if (typeof File !== "undefined") {
      if (img.file) fd.append("images", img.file, img.file.name);
      else fd.append("images", await uriToFile(img.uri, name, type));
    } else {
      // Mobile RN
      fd.append("images", { uri: img.uri, name, type } as any);
    }
  }

  return fd;
}

// ================= API =================

export async function getProducts(): Promise<Product[]> {
  const { data } = await api.get("/products");
  return data as Product[];
}

export async function getProduct(id: string): Promise<Product> {
  const { data } = await api.get(`/products/${id}`);
  return data as Product;
}

// ✅ CREATE: WEB => fetch , MOBILE => axios
export async function createProduct(payload: ProductPayload, images: ImageFile[] = []) {
  if (!images.length) {
    // backend عندك controller create يستعمل FilesInterceptor => إذا images required في back، هذي باش ترجع 400
    // خليها هنا safety فقط، أما في UI باش نفرض images
    const { data } = await api.post("/products", payload);
    return data as Product;
  }

  const fd = await toProductFormData(payload, images);

  // ✅ WEB safest
  if (typeof window !== "undefined") {
    const res = await fetch("http://localhost:3000/products", {
      method: "POST",
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw { response: { status: res.status, data } };
    return data as Product;
  }

  // ✅ mobile
  const { data } = await api.post("/products", fd);
  return data as Product;
}

// ✅ UPDATE: WEB => fetch multipart when images , else JSON
export async function updateProduct(id: string, payload: ProductPayload, images: ImageFile[] = []) {
  if (!images.length) {
    const { data } = await api.patch(`/products/${id}`, payload);
    return data as Product;
  }

  const fd = await toProductFormData(payload, images);

  if (typeof window !== "undefined") {
    const res = await fetch(`http://localhost:3000/products/${id}`, {
      method: "PATCH",
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw { response: { status: res.status, data } };
    return data as Product;
  }

  const { data } = await api.patch(`/products/${id}`, fd);
  return data as Product;
}

export async function deleteProduct(id: string) {
  const { data } = await api.delete(`/products/${id}`);
  return data as { message: string };
}