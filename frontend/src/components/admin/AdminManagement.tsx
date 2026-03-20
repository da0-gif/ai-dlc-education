import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { menuApi, categoryApi, storeApi } from '../../services/api';
import { Menu, Category } from '../../types';

const pageStyle: React.CSSProperties = { padding: 24 };
const cardStyle: React.CSSProperties = { background: 'var(--bg-card)', borderRadius: 12, padding: 32, textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)' };

export function MenuManager() {
  const { auth } = useAuth();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', price: '', description: '', category_id: '' });
  const [image, setImage] = useState<File | null>(null);
  const [newCat, setNewCat] = useState('');

  const storeId = auth.storeId!;
  const load = useCallback(async () => {
    const [m, c] = await Promise.all([menuApi.list(storeId), categoryApi.list(storeId)]);
    setMenus(m as Menu[]); setCategories(c as Category[]);
  }, [storeId]);
  useEffect(() => { load(); }, [load]);

  const resetForm = () => { setForm({ name: '', price: '', description: '', category_id: '' }); setImage(null); setEditId(null); };

  const handleSubmit = async () => {
    const fd = new FormData();
    fd.append('name', form.name); fd.append('price', form.price);
    if (form.category_id) fd.append('category_id', form.category_id);
    if (form.description) fd.append('description', form.description);
    if (image) fd.append('image', image);
    if (editId) { await menuApi.update(storeId, editId, fd); }
    else { await menuApi.create(storeId, fd); }
    resetForm(); load();
  };

  const startEdit = (m: Menu) => {
    setEditId(m.id);
    setForm({ name: m.name, price: String(m.price), description: m.description || '', category_id: m.category_id });
  };

  const addCategory = async () => { if (!newCat.trim()) return; await categoryApi.create(storeId, newCat.trim()); setNewCat(''); load(); };

  const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 14, width: '100%' };

  return (
    <div style={pageStyle}>
      <h2 style={{ color: 'var(--text-primary)', marginBottom: 16 }}>메뉴 관리</h2>

      {/* Category */}
      <div style={{ ...cardStyle, textAlign: 'left', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center', padding: 16 }}>
        <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="새 카테고리명" style={{ ...inputStyle, flex: 1 }} />
        <button onClick={addCategory} style={{ padding: '8px 16px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap' }}>추가</button>
      </div>

      {/* Menu Form */}
      <div style={{ ...cardStyle, textAlign: 'left', marginBottom: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="메뉴명" style={inputStyle} />
          <input value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="가격" type="number" style={inputStyle} />
        </div>
        <select value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))} style={inputStyle}>
          <option value="">카테고리 선택</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="메뉴 설명 (선택사항)" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
        <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} style={{ fontSize: 14, color: 'var(--text-secondary)' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSubmit} disabled={!form.name || !form.price || (!editId && !form.category_id)} style={{ flex: 1, padding: '10px 0', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 15 }}>{editId ? '수정' : '등록'}</button>
          {editId && <button onClick={resetForm} style={{ padding: '10px 16px', background: 'var(--btn-secondary)', color: 'var(--btn-secondary-text)', border: 'none', borderRadius: 6, cursor: 'pointer' }}>취소</button>}
        </div>
      </div>

      {/* Menu List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {menus.map(m => (
          <div key={m.id} style={{ ...cardStyle, textAlign: 'left', padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{m.name} <span style={{ fontWeight: 'normal', color: 'var(--text-muted)', fontSize: 13 }}>({categories.find(c => c.id === m.category_id)?.name})</span></div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{m.price.toLocaleString()}원</div>
              {m.description && <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{m.description}</div>}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => startEdit(m)} style={{ padding: '6px 12px', background: 'var(--btn-secondary)', color: 'var(--btn-secondary-text)', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>수정</button>
              <button onClick={async () => { await menuApi.delete(storeId, m.id); load(); }} style={{ padding: '6px 12px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>삭제</button>
            </div>
          </div>
        ))}
        {menus.length === 0 && <div style={cardStyle}>등록된 메뉴가 없습니다.</div>}
      </div>
    </div>
  );
}

export function TableManager() {
  return <div style={pageStyle}><h2 style={{ color: 'var(--text-primary)', marginBottom: 16 }}>테이블 관리</h2><div style={cardStyle}>테이블 설정, 주문 삭제, 이용 완료, 과거 내역</div></div>;
}

export function StoreManager() {
  const [stores, setStores] = useState<{ id: string; name: string; slug: string; address?: string; phone?: string }[]>([]);
  const [form, setForm] = useState({ name: '', slug: '', address: '', phone: '' });
  const [msg, setMsg] = useState('');

  const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 14, width: '100%' };

  const load = useCallback(async () => {
    try { const res = await storeApi.list(); setStores(res as typeof stores); } catch { }
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleSubmit = async () => {
    if (!form.name || !form.slug) return;
    setMsg('');
    try {
      await storeApi.create({ name: form.name, slug: form.slug, address: form.address || undefined, phone: form.phone || undefined });
      setForm({ name: '', slug: '', address: '', phone: '' });
      setMsg('매장이 등록되었습니다.');
      load();
    } catch (err: unknown) { setMsg(err instanceof Error ? err.message : '등록 실패'); }
  };

  return (
    <div style={pageStyle}>
      <h2 style={{ color: 'var(--text-primary)', marginBottom: 16 }}>매장 관리</h2>
      {msg && <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14, background: msg.includes('실패') ? 'rgba(255,59,48,0.15)' : 'rgba(48,209,88,0.15)', color: msg.includes('실패') ? '#ff3b30' : '#30d158' }}>{msg}</div>}
      <div style={{ ...cardStyle, textAlign: 'left', marginBottom: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="매장명" style={inputStyle} />
          <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="매장 식별자 (영문)" style={inputStyle} />
        </div>
        <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="주소 (선택)" style={inputStyle} />
        <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="전화번호 (선택)" style={inputStyle} />
        <button onClick={handleSubmit} disabled={!form.name || !form.slug} style={{ padding: '10px 0', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 15, fontWeight: 700 }}>매장 등록</button>
      </div>
      {stores.map(s => (
        <div key={s.id} style={{ ...cardStyle, textAlign: 'left', padding: 14, marginBottom: 8 }}>
          <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: 4 }}>{s.name} <span style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 'normal' }}>({s.slug})</span></div>
          {s.address && <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>📍 {s.address}</div>}
          {s.phone && <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>📞 {s.phone}</div>}
        </div>
      ))}
      {stores.length === 0 && <div style={cardStyle}>등록된 매장이 없습니다.</div>}
    </div>
  );
}
