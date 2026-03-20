import React, { useState, useEffect, useCallback } from 'react';
import { orderApi } from '../../services/api';
import { useAuth } from '../auth/AuthProvider';
import { Order } from '../../types';
import { useLocation } from 'react-router-dom';

export function OrderList() {
  const { auth } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const location = useLocation();

  const load = useCallback(() => {
    if (!auth.storeId || !auth.tableId || !auth.sessionId) return;
    orderApi.list(auth.storeId, auth.tableId, auth.sessionId).then(d => setOrders(d as Order[]));
  }, [auth.storeId, auth.tableId, auth.sessionId]);

  useEffect(() => { load(); }, [load, location.key]);

  const statusCfg: Record<string, { label: string; bg: string }> = { PENDING: { label: '대기중', bg: 'rgba(142,142,147,0.24)' }, PREPARING: { label: '준비중', bg: 'rgba(255,159,10,0.2)' }, COMPLETED: { label: '완료', bg: 'rgba(48,209,88,0.2)' } };
  const statusColor: Record<string, string> = { PENDING: 'var(--text-muted)', PREPARING: '#ff9f0a', COMPLETED: '#30d158' };

  const glass: React.CSSProperties = { background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)', boxShadow: 'var(--glass-shadow)' };

  if (orders.length === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 56px - 64px)', background: 'var(--bg-primary)' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}><div style={{ fontSize: 48, marginBottom: 12 }}>📋</div><p style={{ fontSize: 17, fontWeight: '500' }}>주문 내역이 없습니다.</p></div>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: 'calc(100vh - 56px - 64px)', padding: 20 }}>
      <h2 style={{ color: 'var(--text-primary)', margin: '0 0 16px', fontWeight: '700', letterSpacing: -0.3 }}>주문 내역</h2>
      {orders.map(order => {
        const sc = statusCfg[order.status] || statusCfg.PENDING;
        const sColor = statusColor[order.status] || 'var(--text-muted)';
        return (
          <div key={order.id} style={{ ...glass, borderRadius: 20, padding: 18, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: '700' }}>주문 #{order.order_number}</span>
              <span style={{ padding: '5px 14px', borderRadius: 20, background: sc.bg, color: sColor, fontSize: 13, fontWeight: '600' }}>{sc.label}</span>
            </div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 10 }}>{new Date(order.created_at).toLocaleString()}</div>
            {order.items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: 'var(--text-secondary)', fontSize: 14 }}>
                <span>{item.menu_name} × {item.quantity}</span><span>{item.subtotal.toLocaleString()}원</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 10, paddingTop: 10, textAlign: 'right', color: 'var(--text-primary)', fontSize: 18, fontWeight: '700' }}>{order.total_amount.toLocaleString()}원</div>
          </div>
        );
      })}
    </div>
  );
}
