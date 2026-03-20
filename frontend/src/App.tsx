import React, { useState, useCallback, useEffect, useRef, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
import { storeApi } from './services/api';

const StoreContext = createContext<{ storeSlug: string }>({ storeSlug: '' });
export const useStoreContext = () => useContext(StoreContext);

function CustomerNav({ cartCount }: { cartCount: number }) {
  const { auth, logout } = useAuth();
  const { storeName } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;

  const glass = { background: 'var(--nav-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)' } as React.CSSProperties;

  const navItem = (to: string, label: string, icon: string) => (
    <Link key={to} to={to} style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 2, padding: '6px 16px', color: isActive(to) ? 'var(--accent)' : 'var(--text-muted)', textDecoration: 'none', fontSize: 11, fontWeight: isActive(to) ? '600' : '400', transition: 'color 0.2s' }}>
      <span style={{ fontSize: 22 }}>{icon}</span>{label}
    </Link>
  );

  return (
    <>
      <header style={{ ...glass, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 56, borderBottom: '1px solid var(--glass-border)', position: 'sticky', top: 0, zIndex: 100 }}>
        <span style={{ color: 'var(--accent)', fontSize: 22, fontWeight: '700', letterSpacing: -0.5 }}>{storeName || '송오더'}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {auth.tableId && (
            <div style={{ background: 'var(--accent)', color: '#fff', borderRadius: 14, padding: '4px 14px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,122,255,0.3)' }}>
              <div style={{ fontSize: 9, lineHeight: 1, opacity: 0.8, letterSpacing: 0.5 }}>TABLE</div>
              <div style={{ fontSize: 22, fontWeight: '700', lineHeight: 1.2 }}>{auth.tableId}</div>
            </div>
          )}
          <button onClick={() => { logout(); navigate('/customer'); }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>로그아웃</button>
        </div>
      </header>
      <nav style={{ ...glass, position: 'fixed', bottom: 0, left: 0, right: 0, height: 64, borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {navItem('/customer', '메뉴', '🍽️')}
        {navItem('/customer/orders', '주문내역', '📋')}
        {navItem('/customer/parking', '주차등록', '🅿️')}
        <Link to="/customer/cart" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 16px', color: isActive('/customer/cart') ? 'var(--accent)' : 'var(--text-muted)', textDecoration: 'none', fontSize: 11, fontWeight: isActive('/customer/cart') ? '600' : '400', position: 'relative', transition: 'color 0.2s' }}>
          <span style={{ fontSize: 22 }}>🛒</span> 장바구니
          {cartCount > 0 && <span style={{ position: 'absolute', top: 0, right: 6, background: '#ff3b30', color: '#fff', borderRadius: 10, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: '600', padding: '0 4px' }}>{cartCount}</span>}
        </Link>
      </nav>
    </>
  );
}

function CustomerLayout() {
  const { auth } = useAuth();
  const { loadStoreInfo, setTheme } = useTheme();
  const esRef = useRef<EventSource | null>(null);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (auth.storeId) loadStoreInfo(auth.storeId);
  }, [auth.storeId, loadStoreInfo]);

  useEffect(() => {
    if (!auth.storeId) return;
    const es = new EventSource(`/api/stores/${auth.storeId}/stream`);
    esRef.current = es;
    es.addEventListener('theme_changed', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.theme) setTheme(data.theme);
      } catch {}
    });
    return () => { es.close(); esRef.current = null; };
  }, [auth.storeId, setTheme]);

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
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingBottom: 80 }}>
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
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [stores, setStores] = useState<{ id: string; name: string; slug: string }[]>([]);
  const isSuper = auth.storeId === '__super__';

  useEffect(() => {
    if (isSuper) {
      storeApi.list().then(res => setStores(res as typeof stores)).catch(() => {});
    }
  }, [isSuper]);

  const activeStoreSlug = isSuper ? selectedStore : auth.storeId;

  useEffect(() => {
    if (activeStoreSlug && activeStoreSlug !== '__super__') loadStoreInfo(activeStoreSlug);
  }, [activeStoreSlug, loadStoreInfo]);

  if (!auth.isAuthenticated || auth.role !== 'admin') return <AdminLogin />;

  if (isSuper && !selectedStore) {
    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <nav style={{ display: 'flex', padding: '0 16px', background: 'var(--bg-header)', borderBottom: '1px solid var(--border)', alignItems: 'center', height: 56 }}>
          <span style={{ color: 'var(--accent)', fontSize: 20, fontWeight: 'bold', marginRight: 24 }}>송오더 관리 (전체)</span>
          <Link to="/admin/stores" style={{ padding: '16px 20px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 15 }}>매장</Link>
          <button onClick={logout} style={{ marginLeft: 'auto', padding: '8px 20px', background: 'var(--btn-secondary)', color: 'var(--btn-secondary-text)', border: 'none', borderRadius: 6, fontSize: 14 }}>로그아웃</button>
        </nav>
        <Routes>
          <Route path="stores" element={<StoreManager />} />
          <Route path="*" element={
            <div style={{ padding: 24 }}>
              <h2 style={{ color: 'var(--text-primary)', marginBottom: 20 }}>매장을 선택하세요</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {stores.map(s => (
                  <div key={s.id} onClick={() => setSelectedStore(s.slug)} style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, border: '1px solid var(--border)', cursor: 'pointer' }}>
                    <div style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{s.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{s.slug}</div>
                  </div>
                ))}
              </div>
            </div>
          } />
        </Routes>
      </div>
    );
  }

  const storeName = isSuper ? stores.find(s => s.slug === selectedStore)?.name : undefined;

  return (
    <StoreContext.Provider value={{ storeSlug: activeStoreSlug! }}>
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <nav style={{ display: 'flex', gap: 0, padding: '0 16px', background: 'var(--bg-header)', borderBottom: '1px solid var(--border)', alignItems: 'center', height: 56 }}>
          <span style={{ color: 'var(--accent)', fontSize: 20, fontWeight: 'bold', marginRight: 24 }}>
            {isSuper && <span onClick={() => setSelectedStore(null)} style={{ cursor: 'pointer' }}>◀ </span>}
            송오더 관리{storeName ? ` - ${storeName}` : ''}
          </span>
          {[
            { to: '/admin', label: '대시보드' },
            { to: '/admin/menus', label: '메뉴' },
            { to: '/admin/tables', label: '테이블' },
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
    </StoreContext.Provider>
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
