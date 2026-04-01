import { useEffect, useRef } from 'react';

const RUNE_SECTIONS = [
  {
    label: 'Composant',
    color: '#7ec8e3',
    runes: ['Aegis', 'Aeris', 'Ceres', 'Charas', 'Creatum', 'Cryos', 'Elementis', 'Ethas', 'Gayas', 'Geos', 'Iras', 'Lunar', 'Mystem', 'Nergis', 'Pyros', 'Solar', 'Velum'],
  },
  {
    label: 'Manifestation',
    color: '#6dd9a0',
    runes: ['Boulem', 'Cerclum', 'Conum', 'Linim', 'Persom', 'Tactim'],
  },
  {
    label: 'Effet',
    color: '#f0b060',
    runes: ['Altra', 'Chanta', 'Cratia', 'Destra', 'Procta'],
  },
];

const PANEL_W = 300;

export default function RuneSelector({ triangleId, position, onSelect, onClear, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!triangleId) return;
    function handleMouseDown(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [triangleId, onClose]);

  if (!triangleId) return null;

  const left = Math.min(position.x + 8, window.innerWidth - PANEL_W - 8);
  const top  = Math.min(position.y + 8, window.innerHeight - 500);

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left,
        top: Math.max(8, top),
        zIndex: 1000,
        background: '#1e1e2e',
        border: '1px solid #555',
        borderRadius: 8,
        padding: 12,
        width: PANEL_W,
        boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <strong style={{ color: '#ccc', fontSize: 14 }}>Choisir une rune</strong>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
        >
          ✕
        </button>
      </div>

      {RUNE_SECTIONS.map(({ label, color, runes }) => (
        <div key={label} style={{ marginBottom: 10 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 'bold',
            color,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 5,
            borderBottom: `1px solid ${color}44`,
            paddingBottom: 3,
          }}>
            {label}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {runes.map((rune) => (
              <button
                key={rune}
                onClick={() => onSelect(rune)}
                style={{
                  fontSize: 11,
                  padding: '4px 7px',
                  background: '#2a2a3e',
                  border: `1px solid ${color}66`,
                  borderRadius: 4,
                  color: '#ddd',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = color + '33'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#2a2a3e'; }}
              >
                {rune}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={onClear}
        style={{
          marginTop: 6,
          width: '100%',
          padding: '6px 0',
          background: '#3a1f1f',
          border: '1px solid #7a3a3a',
          borderRadius: 4,
          color: '#f08080',
          cursor: 'pointer',
          fontSize: 12,
        }}
      >
        Effacer la rune
      </button>
    </div>
  );
}
