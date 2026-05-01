import RuneBadges from './RuneBadges';
import SpellStats from './SpellStats';
import { useTheme } from '../context/ThemeContext';

export default function SpellList({ detectedSpells, onSpellHover }) {
  const { T } = useTheme();

  const grouped = [];
  const countMap = new Map();
  for (const entry of detectedSpells) {
    const key = entry.spell.nom;
    if (!countMap.has(key)) {
      countMap.set(key, grouped.length);
      grouped.push({ ...entry, triples: [entry.triple], count: 1 });
    } else {
      const g = grouped[countMap.get(key)];
      g.triples.push(entry.triple);
      g.count++;
    }
  }

  function typeColor(type) {
    return { Divin: T.divin, Arcane: T.arcane, Céleste: T.celeste }[type] ?? T.fallbackType;
  }

  return (
    <div style={{ padding: '12px 0' }}>
      <h2 style={{
        color: T.gold, borderBottom: `1px solid ${T.border}`,
        paddingBottom: 8, marginBottom: 16, fontSize: '1em',
        fontFamily: "'Cinzel', serif", letterSpacing: '0.05em',
      }}>
        Sorts détectés ({grouped.length})
      </h2>

      {grouped.length === 0 && (
        <p style={{ color: T.textDim, fontStyle: 'italic', fontSize: 13 }}>
          Aucun sort détecté — placez des runes sur 3 triangles adjacents.
        </p>
      )}

      {grouped.map(({ spell, triples, count }) => {
        const color = typeColor(spell.type);
        return (
          <div
            key={spell.nom}
            className="spell-card"
            onMouseEnter={() => onSpellHover(triples.flat())}
            onMouseLeave={() => onSpellHover(null)}
            style={{
              padding: '10px 14px', marginBottom: 8,
              background: T.bgCard, borderRadius: 4,
              border: `1px solid ${T.border}`, borderLeftWidth: 3, borderLeftColor: color,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {count > 1 && (
                  <span style={{
                    background: color + '22', border: `1px solid ${color}`,
                    color, fontSize: 11, fontWeight: 'bold', borderRadius: 3, padding: '1px 6px',
                  }}>
                    ×{count}
                  </span>
                )}
                <strong style={{ color: T.textPrimary, fontSize: 14, fontFamily: "'Cinzel', serif" }}>{spell.nom}</strong>
              </div>
              <span style={{ color, fontSize: 11, fontWeight: 'bold', fontStyle: 'italic' }}>{spell.type}</span>
            </div>
            <div style={{ marginTop: 6 }}>
              <RuneBadges runes={spell.runes} />
            </div>
            {spell.description && (
              <div style={{ color: T.textMuted, fontSize: 12, marginTop: 5, lineHeight: 1.5, fontStyle: 'italic' }}>
                {spell.description}
              </div>
            )}
            <SpellStats spell={spell} />
            {spell.amelioration && (
              <div style={{ marginTop: 5, fontSize: 11, color: T.gold }}>✦ Amélioration</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
