import React from 'react';
import { useTheme } from '../theme/ThemeProvider';

export function ThemeSettings() {
  const { theme, toggle } = useTheme();

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: 'var(--text-primary)', marginBottom: 20 }}>테마 설정</h2>
      <div style={{ display: 'flex', gap: 20 }}>
        {/* 다크 모드 카드 */}
        <div
          onClick={() => theme !== 'dark' && toggle()}
          style={{
            flex: 1, maxWidth: 280, background: '#1a1a1a', borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
            border: theme === 'dark' ? '3px solid var(--accent)' : '3px solid transparent',
          }}
        >
          <div style={{ padding: 16 }}>
            <div style={{ background: '#111', borderRadius: 8, padding: 8, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#e53935', fontWeight: 'bold', fontSize: 14 }}>t 오더</span>
                <div style={{ background: '#e53935', color: '#fff', borderRadius: 4, padding: '2px 6px', fontSize: 10 }}>12</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ width: 40, background: '#2a2a2a', borderRadius: 4, padding: 4 }}>
                <div style={{ background: '#e53935', borderRadius: 2, height: 12, marginBottom: 4 }} />
                <div style={{ background: '#333', borderRadius: 2, height: 12, marginBottom: 4 }} />
                <div style={{ background: '#333', borderRadius: 2, height: 12 }} />
              </div>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                <div style={{ background: '#2a2a2a', borderRadius: 4, height: 50 }} />
                <div style={{ background: '#2a2a2a', borderRadius: 4, height: 50 }} />
                <div style={{ background: '#2a2a2a', borderRadius: 4, height: 50 }} />
                <div style={{ background: '#2a2a2a', borderRadius: 4, height: 50 }} />
              </div>
            </div>
          </div>
          <div style={{ padding: '12px 16px', background: theme === 'dark' ? 'var(--accent)' : '#333', textAlign: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>
              {theme === 'dark' ? '✓ ' : ''}다크 모드
            </span>
          </div>
        </div>

        {/* 라이트 모드 카드 */}
        <div
          onClick={() => theme !== 'light' && toggle()}
          style={{
            flex: 1, maxWidth: 280, background: '#f5f5f5', borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
            border: theme === 'light' ? '3px solid var(--accent)' : '3px solid transparent',
          }}
        >
          <div style={{ padding: 16 }}>
            <div style={{ background: '#fff', borderRadius: 8, padding: 8, marginBottom: 8, border: '1px solid #e0e0e0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: 14 }}>t 오더</span>
                <div style={{ background: '#d32f2f', color: '#fff', borderRadius: 4, padding: '2px 6px', fontSize: 10 }}>12</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ width: 40, background: '#fff', borderRadius: 4, padding: 4, border: '1px solid #e0e0e0' }}>
                <div style={{ background: '#d32f2f', borderRadius: 2, height: 12, marginBottom: 4 }} />
                <div style={{ background: '#e0e0e0', borderRadius: 2, height: 12, marginBottom: 4 }} />
                <div style={{ background: '#e0e0e0', borderRadius: 2, height: 12 }} />
              </div>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                <div style={{ background: '#fff', borderRadius: 4, height: 50, border: '1px solid #e0e0e0' }} />
                <div style={{ background: '#fff', borderRadius: 4, height: 50, border: '1px solid #e0e0e0' }} />
                <div style={{ background: '#fff', borderRadius: 4, height: 50, border: '1px solid #e0e0e0' }} />
                <div style={{ background: '#fff', borderRadius: 4, height: 50, border: '1px solid #e0e0e0' }} />
              </div>
            </div>
          </div>
          <div style={{ padding: '12px 16px', background: theme === 'light' ? '#d32f2f' : '#e0e0e0', textAlign: 'center' }}>
            <span style={{ color: theme === 'light' ? '#fff' : '#424242', fontWeight: 'bold', fontSize: 15 }}>
              {theme === 'light' ? '✓ ' : ''}라이트 모드
            </span>
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--text-muted)', marginTop: 16, fontSize: 14 }}>
        선택한 테마는 고객 화면과 관리자 화면 모두에 적용됩니다.
      </p>
    </div>
  );
}
