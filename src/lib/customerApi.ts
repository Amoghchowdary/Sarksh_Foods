const customerBase = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/$/, "");

export type CustomerProfile = {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  createdAt: string;
  lastLoginAt: string;
};

export type CustomerAddress = {
  id: string;
  customerId: string;
  label: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CustomerProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  packSize: string;
  status: string;
  featured: boolean;
  stockLabel: string;
  shortDescription: string;
  imageUrl: string;
  driveFileId: string;
  createdAt: string;
  updatedAt: string;
};

export type CustomerOrder = {
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

export type CustomerBootstrap = {
  ok: true;
  customer: CustomerProfile;
  addresses: CustomerAddress[];
  orders: CustomerOrder[];
  products: CustomerProduct[];
  payments: {
    onlineEnabled: boolean;
    provider: string;
    message: string;
  };
};

type ApiResponse = { ok?: boolean; message?: string; [key: string]: unknown };

async function call<T extends ApiResponse>(payload: Record<string, unknown>): Promise<T> {
  if (!customerBase) throw new Error("Production backend URL is not configured.");
  const response = await fetch(customerBase, {
    method: "POST",
    headers: { "content-type": "text/plain;charset=UTF-8" },
    body: JSON.stringify(payload),
    redirect: "follow",
  });
  const text = await response.text();
  let result: T;
  try {
    result = JSON.parse(text) as T;
  } catch {
    throw new Error(text.slice(0, 180) || "Customer API returned an invalid response.");
  }
  if (!response.ok || !result.ok) throw new Error(result.message || "The request could not be completed.");
  return result;
}

function authed<T extends ApiResponse>(action: string, sessionToken: string, payload: Record<string, unknown> = {}) {
  return call<T>({ action, sessionToken, ...payload });
}

export const customerApi = {
  register: (payload: { fullName: string; phone: string; email: string; password: string }) =>
    call<{ ok: true; sessionToken: string; customer: CustomerProfile }>({ action: "customer.register", ...payload }),
  login: (email: string, password: string) =>
    call<{ ok: true; sessionToken: string; customer: CustomerProfile }>({ action: "customer.login", email, password }),
  logout: (sessionToken: string) => call<{ ok: true }>({ action: "customer.logout", sessionToken }),
  bootstrap: (sessionToken: string) => authed<CustomerBootstrap>("customer.bootstrap", sessionToken),
  saveAddress: (sessionToken: string, address: Partial<CustomerAddress>) =>
    authed<{ ok: true; id: string; addresses: CustomerAddress[] }>("customer.address.upsert", sessionToken, { address }),
  deleteAddress: (sessionToken: string, addressId: string) =>
    authed<{ ok: true; addresses: CustomerAddress[] }>("customer.address.delete", sessionToken, { addressId }),
  createOrder: (sessionToken: string, payload: { productSlug: string; quantity: number; addressId: string; notes?: string }) =>
    authed<{ ok: true; id: string }>("customer.order.create", sessionToken, payload),
  reorder: (sessionToken: string, reference: string, addressId: string) =>
    authed<{ ok: true; id: string }>("customer.order.reorder", sessionToken, { reference, addressId }),
  changePassword: (sessionToken: string, currentPassword: string, newPassword: string) =>
    authed<{ ok: true; sessionToken: string }>("customer.password.change", sessionToken, { currentPassword, newPassword }),
  requestPasswordReset: (email: string) =>
    call<{ ok: true; message: string }>({ action: "customer.password.request", email }),
  resetPassword: (email: string, code: string, newPassword: string) =>
    call<{ ok: true; message: string }>({ action: "customer.password.reset", email, code, newPassword }),
};
