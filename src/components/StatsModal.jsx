import { useEffect, useRef, useState } from 'react';
import { useStats, DEFAULT_STATS } from '../context/StatsContext';

const STATS_CONFIG = [
  { key: 'introspection', label: 'Introspection',  description: 'Utilisé pour certains sorts Célestes' },
  { key: 'puissance',     label: 'Puissance',     description: 'Ajouté à la puissance des sorts' },
  { key: 'mesure',        label: 'Mesure',         description: 'Ajouté à la portée (3 Mètres + Mesure)' },
  { key: 'persistance',   label: 'Persistance',    description: 'Ajouté à la durée des sorts' },
];

export default function StatsModal({ onClose }) {
  const { stats, updateStats } = useStats();
  // Store as strings so the field can be cleared while typing
  const [draft, setDraft] = useState(
    Object.fromEntries(Object.entries(stats).map(([k, v]) => [k, String(v)]))
  );
  const backdropRef = useRef(null);

  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function handleBackdropClick(e) {
    if (e.target === backdropRef.current) onClose();
  }

  function handleSave() {
    updateStats(Object.fromEntries(Object.entries(draft).map(([k, v]) => [k, Math.max(0, parseInt(v) || 0)])));
    onClose();
  }

  function handleReset() {
    setDraft(Object.fromEntries(Object.entries(DEFAULT_STATS).map(([k, v]) => [k, String(v)])));
  }

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div style={{
        background: '#1e1e2e',
        border: '1px solid #555',
        borderRadius: 10,
        padding: 24,
        width: '100%',
        maxWidth: 380,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: '1.1em', color: '#eee' }}>Statistiques du personnage</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {STATS_CONFIG.map(({ key, label, description }) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <label style={{ color: '#ccc', fontSize: 13, fontWeight: 'bold' }}>{label}</label>
              <span style={{ color: '#666', fontSize: 11 }}>{description}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => setDraft(d => ({ ...d, [key]: String(Math.max(0, (parseInt(d[key]) || 0) - 1)) }))}
                style={{ width: 32, height: 32, background: '#2a2a3e', border: '1px solid #555', borderRadius: 5, color: '#eee', fontSize: 16, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >−</button>
              <input
                type="number"
                min={0}
                value={draft[key]}
                onChange={(e) => setDraft(d => ({ ...d, [key]: e.target.value }))}
                onBlur={(e) => setDraft(d => ({ ...d, [key]: String(Math.max(0, parseInt(e.target.value) || 0)) }))}
                style={{
                  flex: 1, textAlign: 'center', padding: '6px 0',
                  background: '#2a2a3e', border: '1px solid #555', borderRadius: 5,
                  color: '#eee', fontSize: 16, fontWeight: 'bold',
                }}
              />
              <button
                onClick={() => setDraft(d => ({ ...d, [key]: String((parseInt(d[key]) || 0) + 1) }))}
                style={{ width: 32, height: 32, background: '#2a2a3e', border: '1px solid #555', borderRadius: 5, color: '#eee', fontSize: 16, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >+</button>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
          <button
            onClick={handleReset}
            style={{ flex: 1, padding: '8px 0', background: '#2a2a3e', border: '1px solid #555', borderRadius: 6, color: '#aaa', fontSize: 13, cursor: 'pointer' }}
          >
            Réinitialiser
          </button>
          <button
            onClick={handleSave}
            style={{ flex: 2, padding: '8px 0', background: '#2a3a5e', border: '1px solid #4a6a9e', borderRadius: 6, color: '#7ec8e3', fontSize: 13, fontWeight: 'bold', cursor: 'pointer' }}
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}
