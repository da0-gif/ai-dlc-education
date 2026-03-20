import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../auth/AuthProvider';
import { storeApi } from '../../services/api';

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const { auth } = useAuth();

  const handleSelect = async (t: 'dark' | 'light') => {
    if (!auth.storeId) return;
    try {
      await storeApi.update(auth.storeId, { theme: t });
      setTheme(t);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '테마 변경 실패');
    }
  };

  const previewCard = (mode: 'dark' | 'light', label: string) => {
    const isDark = mode === 'dark';
    const bg = isDark ? '#1a1a1a' : '#f5f5f5';
    const headerBg = isDark ? '#111' : '#fff';
    const cardBg = isDark ? '#2a2a2a' : '#fff';
    const sidebarBg = isDark ? '#2a2a2a' : '#fff';
    const itemBg = isDark ? '#333' : '#e0e0e0';
    const accent = isDark ? '#e53935' : '#d32f2f';
    const borderStyle = isDark ? 'none' : '1px solid #e0e0e0';
    const selected = theme === mode;

    return (
      <div onClick={() => handleSelect(mode)} style={{ flex: 1, maxWidth: 280, background: bg, borderRadius: 16, overflow: 'hidden', cursor: 'pointer', border: selected ? `3px solid ${accent}` : '3px solid transparent' }}>
        <div style={{ padding: 16 }}>
          <div style={{ background: headerBg, borderRadius: 8, padding: 8, marginBottom: 8, border: borderStyle }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: accent, fontWeight: 'bold', fontSize: 14 }}>t 오더</span>
              <div style={{ background: accent, color: '#fff', borderRadius: 4, padding: '2px 6px', fontSize: 10 }}>12</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ width: 40, background: sidebarBg, borderRadius: 4, padding: 4, border: borderStyle }}>
              <div style={{ background: accent, borderRadius: 2, height: 12, marginBottom: 4 }} />
              <div style={{ background: itemBg, borderRadius: 2, height: 12, marginBottom: 4 }} />
              <div style={{ background: itemBg, borderRadius: 2, height: 12 }} />
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {[0,1,2,3].map(i => <div key={i} style={{ background: cardBg, borderRadius: 4, height: 50, border: borderStyle }} />)}
            </div>
          </div>
        </div>
        <div style={{ padding: '12px 16px', background: selected ? accent : itemBg, textAlign: 'center' }}>
          <span style={{ color: selected ? '#fff' : (isDark ? '#ccc' : '#424242'), fontWeight: 'bold', fontSize: 15 }}>
            {selected ? '✓ ' : ''}{label}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: 'var(--text-primary)', marginBottom: 20 }}>테마 설정</h2>
      <div style={{ display: 'flex', gap: 20 }}>
        {previewCard('dark', '다크 모드')}
        {previewCard('light', '라이트 모드')}
      </div>
      <p style={{ color: 'var(--text-muted)', marginTop: 16, fontSize: 14 }}>
        선택한 테마는 매장의 모든 테이블 고객 화면에 동일하게 적용됩니다.
      </p>
    </div>
  );
}
