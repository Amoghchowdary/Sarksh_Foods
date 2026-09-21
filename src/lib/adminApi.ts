import { postAppsScript, requireSessionToken, type AppsScriptResponse } from "@/lib/apiTransport";

const DEFAULT_API_BASE = "https://script.google.com/macros/s/AKfycbw_nR3t5gJfE5BOB4F1NduKDL1Mm10ad73BbnXRygL9pWDm-EwqmcegcVyswZimIYTtgA/exec";
const adminBase = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE).trim().replace(/\/$/, "");

export type AdminStats = {
  products: number;
  activeProducts: number;
  newOrders: number;
  newEnquiries: number;
  websitesOnline: number;
  websites: number;
  customers: number;
};

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  packSize: string;
  status: "Active" | "Draft" | "Archived" | string;
  featured: boolean;
  stockLabel: string;
  shortDescription: string;
  imageUrl: string;
  driveFileId: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminOrder = {
  reference: string;
  createdAt: string;
  productSlug: string;
  productName: string;
  packSize: string;
  customer: string;
  phone: string;
  email: string;
  buyerType: string;
  quantity: number;
  pincode: string;
  address: string;
  notes: string;
  status: string;
  updatedAt: string;
  customerId?: string;
  addressId?: string;
  paymentMethod?: string;
  paymentStatus?: string;
};

export type AdminEnquiry = {
  reference: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  requirementType: string;
  requirementDetails: string;
  status: string;
  updatedAt: string;
};

export type AdminWebsite = {
  id: string;
  name: string;
  url: string;
  environment: string;
  status: string;
  httpStatus: number | null;
  responseMs: number | null;
  lastChecked: string;
  notes: string;
  updatedAt: string;
};


export type AdminCustomer = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  lastLoginAt: string;
  updatedAt: string;
};

export type AdminBootstrap = {
  ok: true;
  admin: { email: string; name: string };
  stats: AdminStats;
  products: AdminProduct[];
  orders: AdminOrder[];
  enquiries: AdminEnquiry[];
  websites: AdminWebsite[];
  customers: AdminCustomer[];
  resources: { spreadsheetUrl: string; driveFolderUrl: string };
};

type AdminResponse = AppsScriptResponse;

function post<T extends AdminResponse>(payload: Record<string, unknown>): Promise<T> {
  return postAppsScript<T>(adminBase, payload, "Admin");
}

function adminCall<T extends AdminResponse>(action: string, sessionToken: string, payload: Record<string, unknown> = {}): Promise<T> {
  return post<T>({ action, sessionToken: requireSessionToken(sessionToken, "Admin login"), ...payload });
}

export const adminApi = {
  login: (email: string, password: string) => post<{ ok: true; sessionToken: string; mustChangePassword?: boolean; admin: { email: string; name: string } }>({ action: "admin.login", email: email.trim().toLowerCase(), password }).then((result) => ({ ...result, sessionToken: requireSessionToken(result.sessionToken, "Admin login") })),
  logout: (sessionToken: string) => post<{ ok: true }>({ action: "admin.logout", sessionToken }),
  changePassword: (sessionToken: string, currentPassword: string, newPassword: string) => post<{ ok: true; sessionToken: string; mustChangePassword?: boolean }>({ action: "admin.password.change", sessionToken: requireSessionToken(sessionToken, "Admin login"), currentPassword, newPassword }).then((result) => ({ ...result, sessionToken: requireSessionToken(result.sessionToken, "Admin password change") })),
  bootstrap: (token: string) => adminCall<AdminBootstrap>("admin.bootstrap", token),
  saveProduct: (token: string, product: Record<string, unknown>) => adminCall("admin.product.upsert", token, { product }),
  updateOrderStatus: (token: string, reference: string, status: string) => adminCall("admin.order.status", token, { reference, status }),
  updateEnquiryStatus: (token: string, reference: string, status: string) => adminCall("admin.enquiry.status", token, { reference, status }),
  saveWebsite: (token: string, website: Record<string, unknown>) => adminCall("admin.website.upsert", token, { website }),
  checkWebsite: (token: string, id: string) => adminCall("admin.website.check", token, { id }),
  checkAllWebsites: (token: string) => adminCall("admin.website.checkall", token),
};
