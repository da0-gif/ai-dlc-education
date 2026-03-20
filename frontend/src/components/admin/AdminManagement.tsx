import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useStoreContext } from '../../App';
import { menuApi, categoryApi, storeApi, tableApi, orderApi } from '../../services/api';
import { Menu, Category } from '../../types';

const pageStyle: React.CSSProperties = { padding: 24 };
const cardStyle: React.CSSProperties = { background: 'var(--bg-card)', borderRadius: 12, padding: 32, textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)' };

export function MenuManager() {
  const { storeSlug } = useStoreContext();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', price: '', description: '', category_id: '' });
  const [image, setImage] = useState<File | null>(null);
  const [newCat, setNewCat] = useState('');

  const storeId = storeSlug;
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
  const { storeSlug } = useStoreContext();
  const [tables, setTables] = useState<{ id: string; table_number: number }[]>([]);
  const [activeTables, setActiveTables] = useState<string[]>([]);
  const [form, setForm] = useState({ table_number: '', password: '' });
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [history, setHistory] = useState<{ id: string; order_data: Record<string, unknown>; total_amount: number; completed_at: string }[]>([]);
  const [editPw, setEditPw] = useState<{ id: string; pw: string } | null>(null);
  const [msg, setMsg] = useState('');

  const storeId = storeSlug;
  const load = useCallback(async () => {
    const [t, a] = await Promise.all([tableApi.list(storeId), tableApi.active(storeId)]);
    setTables(t as typeof tables);
    setActiveTables(a as string[]);
  }, [storeId]);
  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.table_number || !form.password) return;
    setMsg('');
    try {
      await tableApi.create(storeId, { table_number: Number(form.table_number), password: form.password });
      setForm({ table_number: '', password: '' });
      setMsg('테이블이 등록되었습니다.');
      load();
    } catch (err: unknown) { setMsg(err instanceof Error ? err.message : '등록 실패'); }
  };

  const handleComplete = async (tableId: string) => {
    try {
      await tableApi.complete(storeId, tableId);
      setMsg('이용 완료 처리되었습니다.');
      load();
    } catch (err: unknown) { setMsg(err instanceof Error ? err.message : '처리 실패'); }
  };

  const handleDelete = async (tableId: string) => {
    try {
      await tableApi.delete(storeId, tableId);
      setMsg('테이블이 삭제되었습니다.');
      if (selectedTable === tableId) { setSelectedTable(null); setHistory([]); }
      load();
    } catch (err: unknown) { setMsg(err instanceof Error ? err.message : '삭제 실패'); }
  };

  const handleUpdatePw = async () => {
    if (!editPw || !editPw.pw) return;
    try {
      await tableApi.updatePassword(storeId, editPw.id, editPw.pw);
      setMsg('비밀번호가 변경되었습니다.');
      setEditPw(null);
    } catch (err: unknown) { setMsg(err instanceof Error ? err.message : '변경 실패'); }
  };

  const viewHistory = async (tableId: string) => {
    setSelectedTable(tableId);
    const h = await tableApi.history(storeId, tableId) as typeof history;
    setHistory(h);
  };

  const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 14, width: '100%' };

  return (
    <div style={pageStyle}>
      <h2 style={{ color: 'var(--text-primary)', marginBottom: 16 }}>테이블 관리</h2>
      {msg && <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14, background: msg.includes('실패') ? 'rgba(255,59,48,0.15)' : 'rgba(48,209,88,0.15)', color: msg.includes('실패') ? '#ff3b30' : '#30d158' }}>{msg}</div>}

      <div style={{ ...cardStyle, textAlign: 'left', marginBottom: 16, padding: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <input value={form.table_number} onChange={e => setForm(p => ({ ...p, table_number: e.target.value }))} placeholder="테이블 번호" type="number" style={{ ...inputStyle, flex: 1 }} />
        <input value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="비밀번호" type="password" style={{ ...inputStyle, flex: 1 }} />
        <button onClick={handleCreate} disabled={!form.table_number || !form.password} style={{ padding: '8px 16px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 700 }}>등록</button>
      </div>

      {editPw && (
        <div style={{ ...cardStyle, textAlign: 'left', marginBottom: 16, padding: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>테이블 {tables.find(t => t.id === editPw.id)?.table_number} 비밀번호</span>
          <input value={editPw.pw} onChange={e => setEditPw(p => p ? { ...p, pw: e.target.value } : p)} placeholder="새 비밀번호" type="password" style={{ ...inputStyle, flex: 1 }} />
          <button onClick={handleUpdatePw} style={{ padding: '8px 16px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 700 }}>변경</button>
          <button onClick={() => setEditPw(null)} style={{ padding: '8px 16px', background: 'var(--btn-secondary)', color: 'var(--btn-secondary-text)', border: 'none', borderRadius: 6, cursor: 'pointer' }}>취소</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {tables.map(t => {
          const isActive = activeTables.includes(t.id);
          return (
            <div key={t.id} style={{ ...cardStyle, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{t.table_number}</div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, padding: '3px 10px', borderRadius: 12, display: 'inline-block', background: isActive ? 'rgba(48,209,88,0.15)' : 'var(--btn-secondary)', color: isActive ? '#30d158' : 'var(--text-muted)' }}>{isActive ? '이용중' : '비어있음'}</div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                {isActive && <button onClick={() => handleComplete(t.id)} style={{ padding: '6px 10px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>이용 완료하기</button>}
                <button onClick={() => viewHistory(t.id)} style={{ padding: '6px 10px', background: 'var(--btn-secondary)', color: 'var(--btn-secondary-text)', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>내역</button>
                <button onClick={() => setEditPw({ id: t.id, pw: '' })} style={{ padding: '6px 10px', background: 'var(--btn-secondary)', color: 'var(--btn-secondary-text)', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>비번</button>
                {!isActive && <button onClick={() => handleDelete(t.id)} style={{ padding: '6px 10px', background: 'rgba(255,59,48,0.12)', color: '#ff3b30', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>삭제</button>}
              </div>
            </div>
          );
        })}
        {tables.length === 0 && <div style={{ ...cardStyle, gridColumn: '1/-1' }}>등록된 테이블이 없습니다.</div>}
      </div>

      {selectedTable && history.length > 0 && (
        <div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 12 }}>테이블 {tables.find(t => t.id === selectedTable)?.table_number} 과거 내역</h3>
          {history.map(h => (
            <div key={h.id} style={{ ...cardStyle, textAlign: 'left', padding: 14, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{h.total_amount.toLocaleString()}원</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(h.completed_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedTable && history.length === 0 && <div style={cardStyle}>과거 내역이 없습니다.</div>}
    </div>
  );
}

export function StoreManager() {
  const [stores, setStores] = useState<{ id: string; name: string; slug: string; address?: string; phone?: string }[]>([]);
  const [form, setForm] = useState({ name: '', slug: '', address: '', phone: '' });
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 14, width: '100%' };
  const btnStyle: React.CSSProperties = { padding: '6px 14px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 };

  const load = useCallback(async () => {
    try { const res = await storeApi.list(); setStores(res as typeof stores); } catch { }
  }, []);
  useEffect(() => { load(); }, [load]);

  const resetForm = () => { setForm({ name: '', slug: '', address: '', phone: '' }); setEditSlug(null); };

  const handleSubmit = async () => {
    if (!form.name || !form.slug) return;
    setMsg('');
    try {
      if (editSlug) {
        await storeApi.update(editSlug, { name: form.name, address: form.address || undefined, phone: form.phone || undefined });
        setMsg('매장이 수정되었습니다.');
      } else {
        await storeApi.create({ name: form.name, slug: form.slug, address: form.address || undefined, phone: form.phone || undefined });
        setMsg('매장이 등록되었습니다.');
      }
      resetForm();
      load();
    } catch (err: unknown) { setMsg(err instanceof Error ? err.message : '처리 실패'); }
  };

  const handleEdit = (s: typeof stores[0]) => {
    setForm({ name: s.name, slug: s.slug, address: s.address || '', phone: s.phone || '' });
    setEditSlug(s.slug);
    setMsg('');
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    setMsg('');
    try {
      await storeApi.delete(slug);
      setMsg('매장이 삭제되었습니다.');
      if (editSlug === slug) resetForm();
      load();
    } catch (err: unknown) { setMsg(err instanceof Error ? err.message : '삭제 실패'); }
  };

  return (
    <div style={pageStyle}>
      <h2 style={{ color: 'var(--text-primary)', marginBottom: 16 }}>매장 관리</h2>
      {msg && <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14, background: msg.includes('실패') ? 'rgba(255,59,48,0.15)' : 'rgba(48,209,88,0.15)', color: msg.includes('실패') ? '#ff3b30' : '#30d158' }}>{msg}</div>}
      <div style={{ ...cardStyle, textAlign: 'left', marginBottom: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="매장명" style={inputStyle} />
          <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="매장 식별자 (영문)" style={inputStyle} disabled={!!editSlug} />
        </div>
        <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="주소 (선택)" style={inputStyle} />
        <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="전화번호 (선택)" style={inputStyle} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSubmit} disabled={!form.name || !form.slug} style={{ ...btnStyle, flex: 1, padding: '10px 0', background: 'var(--accent)', color: '#fff', fontSize: 15 }}>{editSlug ? '매장 수정' : '매장 등록'}</button>
          {editSlug && <button onClick={resetForm} style={{ ...btnStyle, padding: '10px 16px', background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>취소</button>}
        </div>
      </div>
      {stores.map(s => (
        <div key={s.id} style={{ ...cardStyle, textAlign: 'left', padding: 14, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: 4 }}>{s.name} <span style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 'normal' }}>({s.slug})</span></div>
            {s.address && <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>📍 {s.address}</div>}
            {s.phone && <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>📞 {s.phone}</div>}
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button onClick={() => handleEdit(s)} style={{ ...btnStyle, background: 'rgba(0,122,255,0.15)', color: '#007aff' }}>수정</button>
            <button onClick={() => handleDelete(s.slug)} style={{ ...btnStyle, background: 'rgba(255,59,48,0.15)', color: '#ff3b30' }}>삭제</button>
          </div>
        </div>
      ))}
      {stores.length === 0 && <div style={cardStyle}>등록된 매장이 없습니다.</div>}
    </div>
  );
}
