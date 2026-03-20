import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { ThemeProvider, useTheme } from './components/theme/ThemeProvider';
import { TableLogin, AdminLogin } from './components/auth/LoginForms';
import { MenuView } from './components/customer/MenuView';
import { CartManager } from './components/customer/CartManager';
import { OrderList } from './components/customer/OrderList';
import { ParkingRegister } from './components/customer/ParkingRegister';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { MenuManager, TableManager, StoreManager } from './components/admin/AdminManagement';
import { ThemeSettings } from './components/admin/ThemeSettings';
import { CartItem, Menu } from './types';

function CustomerNav({ cartCount }: { cartCount: number }) {
  const { auth } = useAuth();
  const { storeName } = useTheme();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItem = (to: string, label: string, icon: string) => (
    <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', color: isActive(to) ? 'var(--text-primary)' : 'var(--text-muted)', textDecoration: 'none', fontSize: 15, fontWeight: isActive(to) ? 'bold' : 'normal' }}>
      <span>{icon}</span> {label}
    </Link>
  );

  return (
    <>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-header)', padding: '0 16px', height: 56, borderBottom: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--accent)', fontSize: 22, fontWeight: 'bold' }}>{storeName || 't 오더'}</span>
        {auth.tableId && (
          <div style={{ background: 'var(--accent)', color: '#fff', borderRadius: 8, padding: '4px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, lineHeight: 1 }}>테이블번호</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', lineHeight: 1.2 }}>{auth.tableId}</div>
          </div>
        )}
      </header>
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 60, background: 'var(--bg-header)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 100 }}>
        {navItem('/customer', '메뉴', '🍽️')}
        {navItem('/customer/orders', '주문내역', '📋')}
        {navItem('/customer/parking', '주차등록', '🅿️')}
        <Link to="/customer/cart" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', color: isActive('/customer/cart') ? 'var(--text-primary)' : 'var(--text-muted)', textDecoration: 'none', fontSize: 15, fontWeight: isActive('/customer/cart') ? 'bold' : 'normal', position: 'relative' }}>
          <span>🛒</span> 장바구니
          {cartCount > 0 && <span style={{ position: 'absolute', top: 4, right: 8, background: 'var(--accent)', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold' }}>{cartCount}</span>}
        </Link>
      </nav>
    </>
  );
}

function CustomerLayout() {
  const { auth } = useAuth();
  const { loadStoreInfo } = useTheme();
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (auth.storeId) loadStoreInfo(auth.storeId);
  }, [auth.storeId, loadStoreInfo]);

  const saveCart = (items: CartItem[]) => { setCart(items); localStorage.setItem('cart', JSON.stringify(items)); };

  const addToCart = useCallback((menu: Menu) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuId === menu.id);
      const next = existing
        ? prev.map(i => i.menuId === menu.id ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unitPrice } : i)
        : [...prev, { menuId: menu.id, menuName: menu.name, unitPrice: menu.price, quantity: 1, subtotal: menu.price }];
      localStorage.setItem('cart', JSON.stringify(next));
      return next;
    });
  }, []);

  const updateQuantity = (menuId: string, qty: number) => {
    if (qty <= 0) return saveCart(cart.filter(i => i.menuId !== menuId));
    saveCart(cart.map(i => i.menuId === menuId ? { ...i, quantity: qty, subtotal: qty * i.unitPrice } : i));
  };

  if (!auth.isAuthenticated) return <TableLogin />;

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingBottom: 60 }}>
      <CustomerNav cartCount={cart.reduce((s, i) => s + i.quantity, 0)} />
      <Routes>
        <Route index element={<MenuView cart={cart} onAddToCart={addToCart} />} />
        <Route path="cart" element={<CartManager cart={cart} onUpdateQuantity={updateQuantity} onRemove={id => saveCart(cart.filter(i => i.menuId !== id))} onClear={() => saveCart([])} onOrder={() => {}} />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="parking" element={<ParkingRegister />} />
      </Routes>
    </div>
  );
}

function AdminLayout() {
  const { auth, logout } = useAuth();
  const { loadStoreInfo } = useTheme();

  useEffect(() => {
    if (auth.storeId) loadStoreInfo(auth.storeId);
  }, [auth.storeId, loadStoreInfo]);

  if (!auth.isAuthenticated || auth.role !== 'admin') return <AdminLogin />;

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', gap: 0, padding: '0 16px', background: 'var(--bg-header)', borderBottom: '1px solid var(--border)', alignItems: 'center', height: 56 }}>
        <span style={{ color: 'var(--accent)', fontSize: 20, fontWeight: 'bold', marginRight: 24 }}>t 오더 관리</span>
        {[
          { to: '/admin', label: '대시보드' },
          { to: '/admin/menus', label: '메뉴' },
          { to: '/admin/tables', label: '테이블' },
          { to: '/admin/stores', label: '매장' },
          { to: '/admin/theme', label: '테마' },
        ].map(item => (
          <Link key={item.to} to={item.to} style={{ padding: '16px 20px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 15 }}>{item.label}</Link>
        ))}
        <button onClick={logout} style={{ marginLeft: 'auto', padding: '8px 20px', background: 'var(--btn-secondary)', color: 'var(--btn-secondary-text)', border: 'none', borderRadius: 6, fontSize: 14 }}>로그아웃</button>
      </nav>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="menus" element={<MenuManager />} />
        <Route path="tables" element={<TableManager />} />
        <Route path="stores" element={<StoreManager />} />
        <Route path="theme" element={<ThemeSettings />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/customer" replace />} />
            <Route path="/customer/*" element={<CustomerLayout />} />
            <Route path="/admin/*" element={<AdminLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
