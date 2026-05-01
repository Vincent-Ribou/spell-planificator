import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import RoughBox from './RoughBox';

const RUNE_SECTIONS = [
  {
    label: 'Composant',
    colorKey: 'composant',
    runes: ['Aegis', 'Aeris', 'Ceres', 'Charas', 'Creatum', 'Cryos', 'Elementis', 'Ethas', 'Gayas', 'Geos', 'Iras', 'Lunar', 'Mystem', 'Nergis', 'Pyros', 'Solar', 'Velum'],
  },
  {
    label: 'Manifestation',
    colorKey: 'manifestation',
    runes: ['Boulem', 'Cerclum', 'Conum', 'Linim', 'Persom', 'Tactim'],
  },
  {
    label: 'Effet',
    colorKey: 'effet',
    runes: ['Altra', 'Chanta', 'Cratia', 'Destra', 'Procta'],
  },
];

const PANEL_W = 300;

export default function RuneSelector({ triangleId, position, onSelect, onClear, onClose }) {
  const { T } = useTheme();
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
    <RoughBox
      ref={panelRef}
      style={{
        position: 'fixed', left, top: Math.max(8, top), zIndex: 1000,
        background: T.bgCard,
        padding: 16, width: PANEL_W,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <strong style={{ color: T.gold, fontSize: 13, fontFamily: "'Cinzel', serif", letterSpacing: '0.04em' }}>
          Choisir une rune
        </strong>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.textDim, cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>✕</button>
      </div>

      <div style={{ borderTop: `1px solid ${T.border}`, marginBottom: 10 }} />

      {RUNE_SECTIONS.map(({ label, colorKey, runes }) => {
        const color = T[colorKey];
        return (
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
                    background: T.bgInput, border: `1px solid ${color}55`,
                    borderRadius: 3, color: T.textSecondary, cursor: 'pointer',
                    fontFamily: "'Lora', serif",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = color + '22';
                    e.currentTarget.style.color = color;
                    e.currentTarget.style.borderColor = color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = T.bgInput;
                    e.currentTarget.style.color = T.textSecondary;
                    e.currentTarget.style.borderColor = color + '55';
                  }}
                >
                  {rune}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <button
        onClick={onClear}
        style={{
          marginTop: 6, width: '100%', padding: '6px 0',
          background: T.redBg, border: `1px solid ${T.redBorder}`,
          borderRadius: 3, color: T.redText, cursor: 'pointer',
          fontSize: 12, fontFamily: "'Lora', serif",
        }}
      >
        Effacer la rune
      </button>
    </RoughBox>
  );
}
