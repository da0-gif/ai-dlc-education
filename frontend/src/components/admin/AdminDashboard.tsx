import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthProvider';

export function AdminDashboard() {
  const { auth } = useAuth();
  const [sseConnected, setSseConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!auth.storeId) return;
    const es = new EventSource(`/api/admin/stores/${auth.storeId}/orders/stream`);
    esRef.current = es;
    es.onopen = () => setSseConnected(true);
    es.onerror = () => setSseConnected(false);
    return () => es.close();
  }, [auth.storeId]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>주문 대시보드</h2>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: sseConnected ? '#4CAF50' : 'var(--accent)', fontSize: 14 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: sseConnected ? '#4CAF50' : 'var(--accent)', display: 'inline-block' }} />
          {sseConnected ? '실시간 연결됨' : '연결 끊김'}
        </span>
      </div>
      <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 32, textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
        <p>SSE 실시간 연결로 주문을 모니터링합니다.</p>
      </div>
    </div>
  );
}
