import React, { useState, useEffect } from 'react';
import { orderApi } from '../../services/api';
import { useAuth } from '../auth/AuthProvider';
import { Order } from '../../types';

export function OrderList() {
  const { auth } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!auth.storeId || !auth.tableId || !auth.sessionId) return;
    orderApi.list(auth.storeId, auth.tableId, auth.sessionId).then(d => setOrders(d as Order[]));
  }, [auth]);

  const statusCfg: Record<string, { label: string; bg: string }> = { PENDING: { label: '대기중', bg: '#757575' }, PREPARING: { label: '준비중', bg: '#FF9800' }, COMPLETED: { label: '완료', bg: '#4CAF50' } };

  if (orders.length === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 56px - 60px)', background: 'var(--bg-secondary)' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}><div style={{ fontSize: 48, marginBottom: 12 }}>📋</div><p style={{ fontSize: 18 }}>주문 내역이 없습니다.</p></div>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: 'calc(100vh - 56px - 60px)', padding: 20 }}>
      <h2 style={{ color: 'var(--text-primary)', margin: '0 0 16px' }}>주문 내역</h2>
      {orders.map(order => {
        const sc = statusCfg[order.status] || statusCfg.PENDING;
        return (
          <div key={order.id} style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 16, marginBottom: 12, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 'bold' }}>주문 #{order.order_number}</span>
              <span style={{ padding: '4px 12px', borderRadius: 20, background: sc.bg, color: '#fff', fontSize: 13, fontWeight: 'bold' }}>{sc.label}</span>
            </div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 10 }}>{new Date(order.created_at).toLocaleString()}</div>
            {order.items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: 'var(--text-secondary)', fontSize: 14 }}>
                <span>{item.menu_name} × {item.quantity}</span><span>{item.subtotal.toLocaleString()}원</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8, textAlign: 'right', color: 'var(--text-primary)', fontSize: 18, fontWeight: 'bold' }}>{order.total_amount.toLocaleString()}원</div>
          </div>
        );
      })}
    </div>
  );
}
