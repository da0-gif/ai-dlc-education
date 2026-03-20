import React, { useState } from 'react';
import { authApi } from '../../services/api';
import { useAuth } from './AuthProvider';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: 14, fontSize: 16, background: 'var(--bg-input)', border: '1px solid var(--border-input)',
  borderRadius: 14, color: 'var(--text-primary)', boxSizing: 'border-box', marginBottom: 10, outline: 'none',
};

const glass: React.CSSProperties = {
  background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
  border: '1px solid var(--glass-border)', boxShadow: 'var(--glass-shadow)',
};

export function TableLogin() {
  const { login } = useAuth();
  const [slug, setSlug] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try {
      const res = await authApi.tableLogin(slug, Number(tableNumber), password);
      login(res.token, 'customer', { sessionId: res.session_id, storeId: slug, tableId: res.table_id });
    } catch (err: unknown) { setError(err instanceof Error ? err.message : '로그인 실패'); }
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{ ...glass, borderRadius: 24, padding: 32, width: 380, maxWidth: '90%' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 34, fontWeight: '800', color: 'var(--accent)', letterSpacing: -1 }}>송오더</div>
          <p style={{ color: 'var(--text-muted)', margin: '8px 0 0', fontSize: 14 }}>테이블 로그인</p>
        </div>
        {error && <div style={{ background: 'rgba(255,59,48,0.15)', color: '#ff3b30', padding: '10px 16px', borderRadius: 12, marginBottom: 12, fontSize: 14, fontWeight: '500' }}>{error}</div>}
        <input placeholder="매장 식별자" value={slug} onChange={e => setSlug(e.target.value)} style={inputStyle} />
        <input placeholder="테이블 번호" type="number" value={tableNumber} onChange={e => setTableNumber(e.target.value)} style={inputStyle} />
        <input placeholder="비밀번호" type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
        <button type="submit" style={{ width: '100%', padding: 16, fontSize: 17, fontWeight: '700', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer', marginTop: 4, boxShadow: '0 4px 20px rgba(0,122,255,0.3)' }}>로그인</button>
      </form>
    </div>
  );
}

export function AdminLogin() {
  const { login } = useAuth();
  const [slug, setSlug] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try {
      const res = await authApi.adminLogin(slug, username, password);
      login(res.token, 'admin', { storeId: slug });
    } catch (err: unknown) { setError(err instanceof Error ? err.message : '로그인 실패'); }
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{ ...glass, borderRadius: 24, padding: 32, width: 380, maxWidth: '90%' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 34, fontWeight: '800', color: 'var(--accent)', letterSpacing: -1 }}>송오더</div>
          <p style={{ color: 'var(--text-muted)', margin: '8px 0 0', fontSize: 14 }}>관리자 로그인</p>
        </div>
        {error && <div style={{ background: 'rgba(255,59,48,0.15)', color: '#ff3b30', padding: '10px 16px', borderRadius: 12, marginBottom: 12, fontSize: 14, fontWeight: '500' }}>{error}</div>}
        <input placeholder="매장 식별자" value={slug} onChange={e => setSlug(e.target.value)} style={inputStyle} />
        <input placeholder="사용자명" value={username} onChange={e => setUsername(e.target.value)} style={inputStyle} />
        <input placeholder="비밀번호" type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
        <button type="submit" style={{ width: '100%', padding: 16, fontSize: 17, fontWeight: '700', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer', marginTop: 4, boxShadow: '0 4px 20px rgba(0,122,255,0.3)' }}>로그인</button>
      </form>
    </div>
  );
}
