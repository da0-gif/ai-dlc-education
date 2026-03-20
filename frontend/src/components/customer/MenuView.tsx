import React, { useState, useEffect } from 'react';
import { menuApi, categoryApi } from '../../services/api';
import { useAuth } from '../auth/AuthProvider';
import { Menu, Category, CartItem } from '../../types';

interface Props { cart: CartItem[]; onAddToCart: (menu: Menu) => void; }

export function MenuView({ cart, onAddToCart }: Props) {
  const { auth } = useAuth();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeDescId, setActiveDescId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.storeId) return;
    categoryApi.list(auth.storeId).then(d => setCategories(d as Category[]));
    menuApi.list(auth.storeId).then(d => setMenus(d as Menu[]));
  }, [auth.storeId]);

  const filtered = (selectedCategory ? menus.filter(m => m.category_id === selectedCategory) : menus).filter(m => m.image_url);
  const activeName = categories.find(c => c.id === selectedCategory)?.name || '전체메뉴';

  const glass: React.CSSProperties = { background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)', boxShadow: 'var(--glass-shadow)' };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px - 64px)', overflow: 'hidden' }}>
      {/* 카테고리 사이드바 - 글래스 */}
      <aside style={{ width: 100, flexShrink: 0, ...glass, borderRadius: 0, border: 'none', borderRight: '1px solid var(--glass-border)', overflowY: 'auto', padding: '12px 0' }}>
        {[{ id: null, name: '전체' }, ...categories].map(c => {
          const sel = selectedCategory === c.id;
          return (
            <button key={c.id ?? 'all'} onClick={() => setSelectedCategory(c.id)}
              style={{ width: sel ? 'calc(100% - 8px)' : '100%', padding: '14px 8px', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: sel ? '700' : '400', background: sel ? 'var(--accent)' : 'transparent', color: sel ? '#fff' : 'var(--text-secondary)', borderRadius: sel ? 12 : 0, margin: sel ? '2px 4px' : 0, transition: 'all 0.25s ease' }}>
              {c.name}
            </button>
          );
        })}
      </aside>

      {/* 메뉴 그리드 */}
      <main style={{ flex: 1, overflowY: 'auto', padding: 20, background: 'var(--bg-primary)' }}>
        <h2 style={{ color: 'var(--text-primary)', margin: '0 0 16px', fontSize: 22, fontWeight: '700', letterSpacing: -0.3 }}>
          {activeName}<span style={{ color: 'var(--text-muted)', fontSize: 14, marginLeft: 8, fontWeight: '400' }}>{filtered.length}개</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {filtered.map(menu => {
            const qty = cart.find(i => i.menuId === menu.id)?.quantity || 0;
            const isActive = activeDescId === menu.id;
            return (
              <div key={menu.id} style={{ ...glass, borderRadius: 20, overflow: 'hidden', position: 'relative', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
                {/* 이미지 영역 */}
                <div style={{ position: 'relative', width: '100%', paddingTop: '75%', background: 'var(--bg-input)', cursor: 'pointer', overflow: 'hidden' }}
                  onClick={() => setActiveDescId(isActive ? null : menu.id)}>
                  {menu.image_url && <img src={menu.image_url} alt={menu.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                  {menu.is_sold_out && (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#ff453a', fontSize: 22, fontWeight: '800', border: '2.5px solid #ff453a', padding: '4px 16px', borderRadius: 8, transform: 'rotate(-12deg)', letterSpacing: 1 }}>SOLD OUT</span>
                    </div>
                  )}
                  {isActive && (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                      <p style={{ color: '#fff', fontSize: 13, lineHeight: 1.6, textAlign: 'center', margin: 0, wordBreak: 'keep-all', fontWeight: '400' }}>{menu.description || '설명이 없습니다.'}</p>
                    </div>
                  )}
                </div>
                {/* 하단 정보 */}
                <div style={{ padding: '12px 14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: '600', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{menu.name}</div>
                    <div style={{ color: 'var(--text-primary)', fontSize: 17, fontWeight: '700' }}>{menu.price.toLocaleString()}원</div>
                  </div>
                  {!menu.is_sold_out && (
                    <button onClick={() => onAddToCart(menu)} style={{ position: 'relative', width: 44, height: 44, borderRadius: 22, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 18, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,122,255,0.3)', transition: 'transform 0.15s ease' }}>
                      +{qty > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#ff3b30', color: '#fff', borderRadius: 10, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: '700', padding: '0 4px' }}>{qty}</span>}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>메뉴가 없습니다.</p>}
        </div>
      </main>
    </div>
  );
}
