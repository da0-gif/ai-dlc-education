import React, { useState, useEffect } from 'react';
import { parkingApi } from '../../services/api';
import { useAuth } from '../auth/AuthProvider';
import { Parking } from '../../types';

export function ParkingRegister() {
  const { auth } = useAuth();
  const [plateNumber, setPlateNumber] = useState('');
  const [existing, setExisting] = useState<Parking | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.storeId || !auth.tableId || !auth.sessionId) return;
    parkingApi.get(auth.storeId, auth.tableId, auth.sessionId)
      .then(d => { if (d) { setExisting(d as Parking); setPlateNumber((d as Parking).plate_number); } })
      .catch(() => {});
  }, [auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setMessage('');
    try {
      if (!auth.storeId || !auth.tableId || !auth.sessionId) return;
      await parkingApi.register(auth.storeId, auth.tableId, auth.sessionId, plateNumber);
      setMessage('차량 등록이 완료되었습니다.');
      setExisting({ id: '', plate_number: plateNumber, session_id: auth.sessionId });
    } catch (err: unknown) { setError(err instanceof Error ? err.message : '등록 실패'); }
  };

  const glass: React.CSSProperties = { background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)', boxShadow: 'var(--glass-shadow)' };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: 'calc(100vh - 56px - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ ...glass, borderRadius: 24, padding: 32, width: 400, maxWidth: '90%' }}>
        <h2 style={{ color: 'var(--text-primary)', margin: '0 0 8px', textAlign: 'center', fontWeight: '700' }}>🅿️ 무료 주차 등록</h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '0 0 8px', fontSize: 14 }}>완료된 주문이 있어야 등록 가능합니다</p>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '0 0 24px', fontSize: 13, lineHeight: 1.5 }}>주차 등록은 한대만 가능합니다.<br/>추가 등록은 가맹주에게 요청해주세요.</p>
        {message && <div style={{ background: 'rgba(48,209,88,0.15)', color: '#30d158', padding: '10px 16px', borderRadius: 12, marginBottom: 16, fontSize: 14, fontWeight: '500' }}>{message}</div>}
        {error && <div style={{ background: 'rgba(255,59,48,0.15)', color: '#ff3b30', padding: '10px 16px', borderRadius: 12, marginBottom: 16, fontSize: 14, fontWeight: '500' }}>{error}</div>}
        {existing && <div style={{ background: 'var(--bg-input)', padding: '10px 16px', borderRadius: 12, marginBottom: 16, color: 'var(--text-secondary)', fontSize: 14 }}>현재 등록: <strong style={{ color: 'var(--text-primary)' }}>{existing.plate_number}</strong></div>}
        <form onSubmit={handleSubmit}>
          <input placeholder="차량 번호 (예: 12가3456)" value={plateNumber} onChange={e => setPlateNumber(e.target.value)} style={{ width: '100%', padding: 14, fontSize: 18, background: 'var(--bg-input)', border: '1px solid var(--border-input)', borderRadius: 14, color: 'var(--text-primary)', textAlign: 'center', boxSizing: 'border-box', marginBottom: 12, outline: 'none' }} />
          <button type="submit" style={{ width: '100%', padding: 16, fontSize: 17, fontWeight: '700', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,122,255,0.3)' }}>{existing ? '수정하기' : '등록하기'}</button>
        </form>
      </div>
    </div>
  );
}
