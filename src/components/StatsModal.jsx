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
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div style={{
        background: '#1c1508',
        border: '1px solid #8a6820',
        borderRadius: 6, padding: 24,
        width: '100%', maxWidth: 380,
        boxShadow: '0 8px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(201,160,32,0.1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: '1em', color: '#c9a020', fontFamily: "'Cinzel', serif", letterSpacing: '0.05em' }}>
            ✦ Statistiques du personnage
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#5a4828', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 0 }}>✕</button>
        </div>

        <div style={{ borderTop: '1px solid #4a3510', marginBottom: 20 }} />

        {STATS_CONFIG.map(({ key, label, description }) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <label style={{ color: '#c9a020', fontSize: 13, fontWeight: 'bold', fontFamily: "'Cinzel', serif" }}>{label}</label>
              <span style={{ color: '#5a4828', fontSize: 11, fontStyle: 'italic' }}>{description}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => setDraft(d => ({ ...d, [key]: String(Math.max(0, (parseInt(d[key]) || 0) - 1)) }))}
                style={{ width: 32, height: 32, background: '#170f05', border: '1px solid #4a3510', borderRadius: 4, color: '#b8a070', fontSize: 16, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >−</button>
              <input
                type="number"
                min={0}
                value={draft[key]}
                onChange={(e) => setDraft(d => ({ ...d, [key]: e.target.value }))}
                onBlur={(e) => setDraft(d => ({ ...d, [key]: String(Math.max(0, parseInt(e.target.value) || 0)) }))}
                style={{
                  flex: 1, textAlign: 'center', padding: '6px 0',
                  background: '#170f05', border: '1px solid #4a3510', borderRadius: 4,
                  color: '#e8d5a0', fontSize: 16, fontWeight: 'bold', fontFamily: "'Lora', serif",
                }}
              />
              <button
                onClick={() => setDraft(d => ({ ...d, [key]: String((parseInt(d[key]) || 0) + 1) }))}
                style={{ width: 32, height: 32, background: '#170f05', border: '1px solid #4a3510', borderRadius: 4, color: '#b8a070', fontSize: 16, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >+</button>
            </div>
          </div>
        ))}

        <div style={{ borderTop: '1px solid #4a3510', marginTop: 20, marginBottom: 16 }} />

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleReset}
            style={{ flex: 1, padding: '8px 0', background: '#170f05', border: '1px solid #4a3510', borderRadius: 4, color: '#7a6040', fontSize: 13, cursor: 'pointer', fontFamily: "'Lora', serif" }}
          >
            Réinitialiser
          </button>
          <button
            onClick={handleSave}
            style={{ flex: 2, padding: '8px 0', background: '#241a08', border: '1px solid #c9a020', borderRadius: 4, color: '#c9a020', fontSize: 13, fontWeight: 'bold', cursor: 'pointer', fontFamily: "'Cinzel', serif", letterSpacing: '0.03em' }}
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}
