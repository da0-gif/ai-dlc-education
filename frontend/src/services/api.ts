const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { ...(options?.headers as Record<string, string>) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options?.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE}${url}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// Auth
export const authApi = {
  adminLogin: (slug: string, username: string, password: string) =>
    request<{ token: string }>('/auth/admin/login', { method: 'POST', body: JSON.stringify({ slug, username, password }) }),
  tableLogin: (slug: string, table_number: number, password: string) =>
    request<{ token: string; session_id: string }>('/auth/table/login', { method: 'POST', body: JSON.stringify({ slug, table_number, password }) }),
  verify: (token: string) => request<{ valid: boolean }>(`/auth/verify?token=${encodeURIComponent(token)}`),
  logout: (token: string) => request('/auth/logout', { method: 'POST', body: JSON.stringify(token) }).catch(() => {}),
};

// Store
export const storeApi = {
  create: (data: { name: string; slug: string; address?: string; phone?: string }) => request('/admin/stores', { method: 'POST', body: JSON.stringify(data) }),
  list: () => request('/admin/stores'),
  update: (slug: string, data: Record<string, unknown>) => request(`/admin/stores/${slug}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (slug: string) => request(`/admin/stores/${slug}`, { method: 'DELETE' }),
  getTheme: (slug: string) => request<{ name: string; theme: string }>(`/stores/${slug}/info`),
};

// Category
export const categoryApi = {
  list: (storeId: string) => request(`/stores/${storeId}/categories`),
  create: (storeId: string, name: string) => request(`/admin/stores/${storeId}/categories`, { method: 'POST', body: JSON.stringify({ name }) }),
  delete: (storeId: string, id: string) => request(`/admin/stores/${storeId}/categories/${id}`, { method: 'DELETE' }),
};

// Menu
export const menuApi = {
  list: (storeId: string, categoryId?: string) => request(`/stores/${storeId}/menus${categoryId ? `?category_id=${categoryId}` : ''}`),
  create: (storeId: string, formData: FormData) => request(`/admin/stores/${storeId}/menus`, { method: 'POST', body: formData }),
  update: (storeId: string, id: string, formData: FormData) => request(`/admin/stores/${storeId}/menus/${id}`, { method: 'PUT', body: formData }),
  delete: (storeId: string, id: string) => request(`/admin/stores/${storeId}/menus/${id}`, { method: 'DELETE' }),
  reorder: (storeId: string, menuIds: string[]) => request(`/admin/stores/${storeId}/menus/reorder`, { method: 'PUT', body: JSON.stringify({ menu_ids: menuIds }) }),
};

// Order
export const orderApi = {
  create: (storeId: string, tableId: string, sessionId: string, items: { menu_id: string; quantity: number }[]) =>
    request(`/stores/${storeId}/tables/${tableId}/orders`, { method: 'POST', body: JSON.stringify({ session_id: sessionId, items }) }),
  list: (storeId: string, tableId: string, sessionId: string) =>
    request(`/stores/${storeId}/tables/${tableId}/orders?session_id=${sessionId}`),
  updateStatus: (orderId: string, status: string) =>
    request(`/admin/orders/${orderId}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  delete: (orderId: string) => request(`/admin/orders/${orderId}`, { method: 'DELETE' }),
};

// Table
export const tableApi = {
  create: (storeId: string, data: { table_number: number; password: string }) =>
    request(`/admin/stores/${storeId}/tables`, { method: 'POST', body: JSON.stringify(data) }),
  list: (storeId: string) => request(`/admin/stores/${storeId}/tables`),
  complete: (storeId: string, tableId: string) =>
    request(`/admin/stores/${storeId}/tables/${tableId}/complete`, { method: 'POST' }),
  history: (storeId: string, tableId: string, date?: string) =>
    request(`/admin/stores/${storeId}/tables/${tableId}/history${date ? `?date=${date}` : ''}`),
  delete: (storeId: string, tableId: string) =>
    request(`/admin/stores/${storeId}/tables/${tableId}`, { method: 'DELETE' }),
  updatePassword: (storeId: string, tableId: string, password: string) =>
    request(`/admin/stores/${storeId}/tables/${tableId}`, { method: 'PUT', body: JSON.stringify({ password }) }),
  active: (storeId: string) => request(`/admin/stores/${storeId}/tables/active`),
};

// Parking
export const parkingApi = {
  register: (storeId: string, tableId: string, sessionId: string, plateNumber: string) =>
    request(`/stores/${storeId}/tables/${tableId}/parking`, { method: 'POST', body: JSON.stringify({ session_id: sessionId, plate_number: plateNumber }) }),
  get: (storeId: string, tableId: string, sessionId: string) =>
    request(`/stores/${storeId}/tables/${tableId}/parking?session_id=${sessionId}`),
};

// DailySales
export const dailySalesApi = {
  close: (storeId: string) => request(`/admin/stores/${storeId}/daily-sales/close`, { method: 'POST' }),
};
