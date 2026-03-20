import React from 'react';
import { CartItem } from '../../types';
import { orderApi } from '../../services/api';
import { useAuth } from '../auth/AuthProvider';

interface Props { cart: CartItem[]; onUpdateQuantity: (menuId: string, quantity: number) => void; onRemove: (menuId: string) => void; onClear: () => void; onOrder: () => void; }

export function CartManager({ cart, onUpdateQuantity, onRemove, onClear, onOrder }: Props) {
  const { auth } = useAuth();
  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handleOrder = async () => {
    if (!auth.storeId || !auth.tableId || !auth.sessionId || cart.length === 0) return;
    try {
      await orderApi.create(auth.storeId, auth.tableId, auth.sessionId, cart.map(i => ({ menu_id: i.menuId, quantity: i.quantity })));
      onClear(); onOrder();
    } catch (err: unknown) { alert(err instanceof Error ? err.message : '주문 실패'); }
  };

  if (cart.length === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 56px - 60px)', background: 'var(--bg-secondary)' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}><div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div><p style={{ fontSize: 18 }}>장바구니가 비어있습니다.</p></div>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: 'calc(100vh - 56px - 60px)', padding: 20 }}>
      <h2 style={{ color: 'var(--text-primary)', margin: '0 0 16px' }}>장바구니</h2>
      <div style={{ background: 'var(--bg-card)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
        {cart.map((item, i) => (
          <div key={item.menuId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: i < cart.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 'bold' }}>{item.menuName}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 2 }}>{item.unitPrice.toLocaleString()}원</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => onUpdateQuantity(item.menuId, item.quantity - 1)} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border-input)', background: 'transparent', color: 'var(--text-primary)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
              <span style={{ color: 'var(--text-primary)', fontSize: 18, minWidth: 30, textAlign: 'center' }}>{item.quantity}</span>
              <button onClick={() => onUpdateQuantity(item.menuId, item.quantity + 1)} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border-input)', background: 'transparent', color: 'var(--text-primary)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              <span style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 'bold', minWidth: 80, textAlign: 'right' }}>{item.subtotal.toLocaleString()}원</span>
              <button onClick={() => onRemove(item.menuId)} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'var(--btn-secondary)', color: 'var(--accent)', fontSize: 16, cursor: 'pointer' }}>✕</button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
        <button onClick={onClear} style={{ padding: '12px 24px', background: 'var(--btn-secondary)', color: 'var(--btn-secondary-text)', border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}>전체삭제</button>
        <div style={{ color: 'var(--text-primary)', fontSize: 22, fontWeight: 'bold' }}>합계 {total.toLocaleString()}원</div>
      </div>
      <button onClick={handleOrder} style={{ width: '100%', marginTop: 16, padding: 18, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 20, fontWeight: 'bold', cursor: 'pointer' }}>주문하기 ({cart.length}건)</button>
    </div>
  );
}
