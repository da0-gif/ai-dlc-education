export interface Store {
  id: string;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
}

export interface Category {
  id: string;
  name: string;
  sort_order: number;
}

export interface Menu {
  id: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_sold_out: boolean;
  category_id: string;
}

export interface CartItem {
  menuId: string;
  menuName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderItem {
  id: string;
  menu_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: number;
  status: 'PENDING' | 'PREPARING' | 'COMPLETED';
  total_amount: number;
  created_at: string;
  items: OrderItem[];
}

export interface OrderHistory {
  id: string;
  order_data: Record<string, unknown>;
  total_amount: number;
  completed_at: string;
}

export interface Parking {
  id: string;
  plate_number: string;
  session_id: string;
}

export interface DailySales {
  id: string;
  sales_date: string;
  total_amount: number;
  order_count: number;
}

export interface AuthState {
  token: string | null;
  sessionId: string | null;
  storeId: string | null;
  tableId: string | null;
  role: 'customer' | 'admin' | null;
  isAuthenticated: boolean;
}
