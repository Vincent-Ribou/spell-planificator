import RuneBadges from './RuneBadges';
import SpellStats from './SpellStats';

const TYPE_COLORS = {
  Divin:   '#d4a017',
  Arcane:  '#9060d0',
  Céleste: '#4aabdc',
};

function getTypeColor(type) {
  return TYPE_COLORS[type] ?? '#8a7050';
}

export default function SpellList({ detectedSpells, onSpellHover }) {
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

  return (
    <div style={{ padding: '12px 0' }}>
      <h2 style={{
        color: '#c9a020', borderBottom: '1px solid #4a3510',
        paddingBottom: 8, marginBottom: 16, fontSize: '1em',
        fontFamily: "'Cinzel', serif", letterSpacing: '0.05em',
      }}>
        Sorts détectés ({grouped.length})
      </h2>

      {grouped.length === 0 && (
        <p style={{ color: '#5a4828', fontStyle: 'italic', fontSize: 13 }}>
          Aucun sort détecté — placez des runes sur 3 triangles adjacents.
        </p>
      )}

      {grouped.map(({ spell, triples, count }) => {
        const color = getTypeColor(spell.type);
        return (
          <div
            key={spell.nom}
            className="spell-card"
            onMouseEnter={() => onSpellHover(triples.flat())}
            onMouseLeave={() => onSpellHover(null)}
            style={{
              padding: '10px 14px', marginBottom: 8,
              background: '#1c1508', borderRadius: 4,
              border: '1px solid #3a2a10', borderLeftWidth: 3, borderLeftColor: color,
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
                <strong style={{ color: '#e8d5a0', fontSize: 14, fontFamily: "'Cinzel', serif" }}>{spell.nom}</strong>
              </div>
              <span style={{ color, fontSize: 11, fontWeight: 'bold', fontStyle: 'italic' }}>{spell.type}</span>
            </div>
            <div style={{ marginTop: 6 }}>
              <RuneBadges runes={spell.runes} />
            </div>
            {spell.description && (
              <div style={{ color: '#a89070', fontSize: 12, marginTop: 5, lineHeight: 1.5, fontStyle: 'italic' }}>
                {spell.description}
              </div>
            )}
            <SpellStats spell={spell} />
            {spell.amelioration && (
              <div style={{ marginTop: 5, fontSize: 11, color: '#c9a020' }}>✦ Amélioration</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
