import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStoreContext } from '../../App';
import { orderApi } from '../../services/api';
import { Order } from '../../types';

const statusLabel: Record<string, { text: string; bg: string; color: string }> = {
  PENDING: { text: '대기중', bg: 'rgba(255,159,10,0.15)', color: '#ff9f0a' },
  PREPARING: { text: '준비중', bg: 'rgba(0,122,255,0.15)', color: '#007aff' },
};

export function AdminDashboard() {
  const { storeSlug } = useStoreContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [sseConnected, setSseConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const loadOrders = useCallback(async () => {
    if (!storeSlug) return;
    try { const res = await orderApi.listByStore(storeSlug); setOrders(res as Order[]); } catch {}
  }, [storeSlug]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  useEffect(() => {
    if (!storeSlug) return;
    const es = new EventSource(`/api/admin/stores/${storeSlug}/orders/stream`);
    esRef.current = es;
    es.onopen = () => setSseConnected(true);
    es.onerror = () => setSseConnected(false);
    const reload = () => loadOrders();
    es.addEventListener('order:created', reload);
    es.addEventListener('order:status_changed', reload);
    es.addEventListener('order:deleted', reload);
    return () => es.close();
  }, [storeSlug, loadOrders]);

  const handleStatus = async (orderId: string, status: string) => {
    try { await orderApi.updateStatus(orderId, status); loadOrders(); } catch (err: unknown) { alert(err instanceof Error ? err.message : '상태 변경 실패'); }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('주문을 삭제하시겠습니까?')) return;
    try { await orderApi.delete(orderId); loadOrders(); } catch (err: unknown) { alert(err instanceof Error ? err.message : '삭제 실패'); }
  };

  const cardStyle: React.CSSProperties = { background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', padding: 16, marginBottom: 12 };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>주문 대시보드</h2>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: sseConnected ? '#4CAF50' : 'var(--accent)', fontSize: 14 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: sseConnected ? '#4CAF50' : 'var(--accent)', display: 'inline-block' }} />
          {sseConnected ? '실시간 연결됨' : '연결 끊김'}
        </span>
      </div>
      {orders.length === 0 && <div style={{ ...cardStyle, textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>현재 활성 주문이 없습니다.</div>}
      {orders.map(o => {
        const s = statusLabel[o.status] || statusLabel.PENDING;
        return (
          <div key={o.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 700 }}>#{o.order_number}</span>
                <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: s.bg, color: s.color }}>{s.text}</span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(o.created_at).toLocaleTimeString()}</span>
            </div>
            {o.items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: 'var(--text-secondary)', fontSize: 14 }}>
                <span>{item.menu_name} × {item.quantity}</span>
                <span>{item.subtotal.toLocaleString()}원</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{o.total_amount.toLocaleString()}원</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {o.status === 'PENDING' && <button onClick={() => handleStatus(o.id, 'PREPARING')} style={{ padding: '6px 14px', background: 'rgba(0,122,255,0.15)', color: '#007aff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>준비 시작</button>}
                {o.status === 'PREPARING' && <button onClick={() => handleStatus(o.id, 'COMPLETED')} style={{ padding: '6px 14px', background: 'rgba(48,209,88,0.15)', color: '#30d158', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>완료</button>}
                <button onClick={() => handleDelete(o.id)} style={{ padding: '6px 14px', background: 'rgba(255,59,48,0.15)', color: '#ff3b30', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>삭제</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
