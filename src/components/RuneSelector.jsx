import { useEffect, useRef } from 'react';

const RUNE_SECTIONS = [
  {
    label: 'Composant',
    color: '#6aabcf',
    runes: ['Aegis', 'Aeris', 'Ceres', 'Charas', 'Creatum', 'Cryos', 'Elementis', 'Ethas', 'Gayas', 'Geos', 'Iras', 'Lunar', 'Mystem', 'Nergis', 'Pyros', 'Solar', 'Velum'],
  },
  {
    label: 'Manifestation',
    color: '#5ab880',
    runes: ['Boulem', 'Cerclum', 'Conum', 'Linim', 'Persom', 'Tactim'],
  },
  {
    label: 'Effet',
    color: '#c9a020',
    runes: ['Altra', 'Chanta', 'Cratia', 'Destra', 'Procta'],
  },
];

const PANEL_W = 300;

export default function RuneSelector({ triangleId, position, onSelect, onClear, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!triangleId) return;
    function handleMouseDown(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
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
        position: 'fixed', left, top: Math.max(8, top), zIndex: 1000,
        background: '#1c1508', border: '1px solid #8a6820',
        borderRadius: 6, padding: 12, width: PANEL_W,
        boxShadow: '0 4px 24px rgba(0,0,0,0.8)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <strong style={{ color: '#c9a020', fontSize: 13, fontFamily: "'Cinzel', serif", letterSpacing: '0.04em' }}>
          Choisir une rune
        </strong>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#5a4828', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>✕</button>
      </div>

      <div style={{ borderTop: '1px solid #4a3510', marginBottom: 10 }} />

      {RUNE_SECTIONS.map(({ label, color, runes }) => (
        <div key={label} style={{ marginBottom: 10 }}>
          <div style={{
            fontSize: 10, fontWeight: 'bold', color,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            marginBottom: 5, borderBottom: `1px solid ${color}44`,
            paddingBottom: 3, fontFamily: "'Cinzel', serif",
          }}>
            {label}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {runes.map((rune) => (
              <button
                key={rune}
                onClick={() => onSelect(rune)}
                style={{
                  fontSize: 11, padding: '4px 7px',
                  background: '#170f05', border: `1px solid ${color}55`,
                  borderRadius: 3, color: '#b8a070', cursor: 'pointer',
                  fontFamily: "'Lora', serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = color + '22';
                  e.currentTarget.style.color = color;
                  e.currentTarget.style.borderColor = color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#170f05';
                  e.currentTarget.style.color = '#b8a070';
                  e.currentTarget.style.borderColor = color + '55';
                }}
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
          marginTop: 6, width: '100%', padding: '6px 0',
          background: '#1a0808', border: '1px solid #8a2020',
          borderRadius: 3, color: '#d06060', cursor: 'pointer',
          fontSize: 12, fontFamily: "'Lora', serif",
        }}
      >
        Effacer la rune
      </button>
    </div>
  );
}
