import React from 'react';

const pageStyle: React.CSSProperties = { padding: 24 };
const cardStyle: React.CSSProperties = { background: 'var(--bg-card)', borderRadius: 12, padding: 32, textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)' };

export function MenuManager() {
  return <div style={pageStyle}><h2 style={{ color: 'var(--text-primary)', marginBottom: 16 }}>메뉴 관리</h2><div style={cardStyle}>메뉴 CRUD 및 카테고리 관리</div></div>;
}

export function TableManager() {
  return <div style={pageStyle}><h2 style={{ color: 'var(--text-primary)', marginBottom: 16 }}>테이블 관리</h2><div style={cardStyle}>테이블 설정, 주문 삭제, 이용 완료, 과거 내역</div></div>;
}

export function StoreManager() {
  return <div style={pageStyle}><h2 style={{ color: 'var(--text-primary)', marginBottom: 16 }}>매장 관리</h2><div style={cardStyle}>매장 등록 및 관리</div></div>;
}
