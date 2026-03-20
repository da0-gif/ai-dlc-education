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

  const filtered = selectedCategory ? menus.filter(m => m.category_id === selectedCategory) : menus;
  const activeName = categories.find(c => c.id === selectedCategory)?.name || '전체메뉴';

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px - 60px)', overflow: 'hidden' }}>
      <aside style={{ width: 120, flexShrink: 0, background: 'var(--bg-primary)', borderRight: '1px solid var(--border)', overflowY: 'auto', padding: '8px 0' }}>
        <button onClick={() => setSelectedCategory(null)} style={{ width: '100%', padding: '14px 8px', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 'bold', background: !selectedCategory ? 'var(--accent)' : 'transparent', color: !selectedCategory ? '#fff' : 'var(--text-secondary)', borderLeft: !selectedCategory ? '4px solid var(--accent)' : '4px solid transparent' }}>전체</button>
        {categories.map(c => (
          <button key={c.id} onClick={() => setSelectedCategory(c.id)} style={{ width: '100%', padding: '14px 8px', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 'bold', background: selectedCategory === c.id ? 'var(--accent)' : 'transparent', color: selectedCategory === c.id ? '#fff' : 'var(--text-secondary)', borderLeft: selectedCategory === c.id ? '4px solid var(--accent)' : '4px solid transparent' }}>{c.name}</button>
        ))}
      </aside>
      <main style={{ flex: 1, overflowY: 'auto', padding: 20, background: 'var(--bg-secondary)' }}>
        <h2 style={{ color: 'var(--text-primary)', margin: '0 0 16px', fontSize: 22 }}>
          {activeName}<span style={{ color: 'var(--text-muted)', fontSize: 14, marginLeft: 8 }}>{filtered.length}개</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {filtered.map(menu => (
            <div key={menu.id} onClick={() => !menu.is_sold_out && onAddToCart(menu)} style={{ background: 'var(--bg-card)', borderRadius: 12, overflow: 'hidden', cursor: menu.is_sold_out ? 'default' : 'pointer', position: 'relative', transition: 'transform 0.15s', border: '1px solid var(--border)' }}
              onMouseEnter={e => { if (!menu.is_sold_out) (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}>
              <div style={{ position: 'relative', width: '100%', paddingTop: '75%', background: 'var(--bg-input)' }}
                onClick={e => { if (menu.description) { e.stopPropagation(); setActiveDescId(prev => prev === menu.id ? null : menu.id); } }}>
                {menu.image_url ? <img src={menu.image_url} alt={menu.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: 40 }}>🍽️</div>}
                {menu.is_sold_out && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: 'var(--accent)', fontSize: 24, fontWeight: 'bold', border: '3px solid var(--accent)', padding: '4px 16px', borderRadius: 4, transform: 'rotate(-15deg)' }}>SOLD OUT</span></div>}
                {activeDescId === menu.id && menu.description && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}><p style={{ color: '#fff', fontSize: 13, lineHeight: 1.5, textAlign: 'center', margin: 0, wordBreak: 'keep-all' }}>{menu.description}</p></div>}
                {cart.find(i => i.menuId === menu.id) && <div style={{ position: 'absolute', top: 8, right: 8, background: 'var(--accent)', color: '#fff', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 'bold', zIndex: 1 }}>{cart.find(i => i.menuId === menu.id)!.quantity}</div>}
              </div>
              <div style={{ padding: '10px 12px 14px' }}>
                <div style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 'bold', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{menu.name}</div>
                <div style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 'bold' }}>{menu.price.toLocaleString()}원</div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>메뉴가 없습니다.</p>}
        </div>
      </main>
    </div>
  );
}
