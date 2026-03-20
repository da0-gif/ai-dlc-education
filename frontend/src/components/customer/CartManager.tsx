import React, { useState, useEffect } from 'react';
import { CartItem } from '../../types';
import { orderApi } from '../../services/api';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';

interface Props { cart: CartItem[]; onUpdateQuantity: (menuId: string, quantity: number) => void; onRemove: (menuId: string) => void; onClear: () => void; onOrder: () => void; }

export function CartManager({ cart, onUpdateQuantity, onRemove, onClear, onOrder }: Props) {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [popup, setPopup] = useState<{ count: number; total: number } | null>(null);
  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

  useEffect(() => {
    if (!popup) return;
    const timer = setTimeout(() => { setPopup(null); navigate('/customer'); }, 5000);
    return () => clearTimeout(timer);
  }, [popup, navigate]);

  const glass: React.CSSProperties = { background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)', boxShadow: 'var(--glass-shadow)' };

  const handleOrder = async () => {
    if (!auth.storeId || !auth.tableId || !auth.sessionId || cart.length === 0) return;
    try {
      const count = cart.reduce((s, i) => s + i.quantity, 0);
      const orderTotal = total;
      await orderApi.create(auth.storeId, auth.tableId, auth.sessionId, cart.map(i => ({ menu_id: i.menuId, quantity: i.quantity })));
      onClear(); onOrder();
      setPopup({ count, total: orderTotal });
    } catch (err: unknown) { alert(err instanceof Error ? err.message : '주문 실패'); }
  };

  if (cart.length === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 56px - 64px)', background: 'var(--bg-primary)' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}><div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div><p style={{ fontSize: 17, fontWeight: '500' }}>장바구니가 비어있습니다.</p></div>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: 'calc(100vh - 56px - 64px)', padding: 20 }}>
      <h2 style={{ color: 'var(--text-primary)', margin: '0 0 16px', fontWeight: '700', letterSpacing: -0.3 }}>장바구니</h2>
      <div style={{ ...glass, borderRadius: 20, overflow: 'hidden' }}>
        {cart.map((item, i) => (
          <div key={item.menuId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: i < cart.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: '600' }}>{item.menuName}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 2 }}>{item.unitPrice.toLocaleString()}원</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => onUpdateQuantity(item.menuId, item.quantity - 1)} style={{ width: 34, height: 34, borderRadius: 17, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', color: 'var(--text-primary)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
              <span style={{ color: 'var(--text-primary)', fontSize: 17, fontWeight: '600', minWidth: 28, textAlign: 'center' }}>{item.quantity}</span>
              <button onClick={() => onUpdateQuantity(item.menuId, item.quantity + 1)} style={{ width: 34, height: 34, borderRadius: 17, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', color: 'var(--text-primary)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              <span style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: '700', minWidth: 76, textAlign: 'right' }}>{item.subtotal.toLocaleString()}원</span>
              <button onClick={() => onRemove(item.menuId)} style={{ width: 34, height: 34, borderRadius: 17, border: 'none', background: 'rgba(255,59,48,0.12)', color: '#ff3b30', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
        <button onClick={onClear} style={{ padding: '12px 24px', ...glass, borderRadius: 14, fontSize: 15, cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: '500' }}>전체삭제</button>
        <div style={{ color: 'var(--text-primary)', fontSize: 22, fontWeight: '700' }}>합계 {total.toLocaleString()}원</div>
      </div>
      <button onClick={handleOrder} style={{ width: '100%', marginTop: 16, padding: 18, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 16, fontSize: 18, fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,122,255,0.3)', letterSpacing: -0.3 }}>주문하기 ({cart.length}건)</button>
      {popup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setPopup(null)}>
          <div style={{ ...glass, background: 'var(--bg-secondary)', borderRadius: 24, padding: '36px 32px', textAlign: 'center', maxWidth: 320, width: '90%' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ color: 'var(--text-primary)', fontSize: 20, fontWeight: '700', marginBottom: 8 }}>주문이 완료되었습니다!</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 20 }}>총 {popup.count}개 · {popup.total.toLocaleString()}원</div>
            <button onClick={() => { setPopup(null); navigate('/customer/orders'); }} style={{ padding: '12px 40px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: '600', cursor: 'pointer' }}>확인</button>
          </div>
        </div>
      )}
    </div>
  );
}
