import RuneBadges from './RuneBadges';
import SpellStats from './SpellStats';

const TYPE_COLORS = {
  Divin:   '#f0c040',
  Arcane:  '#a070f0',
  Céleste: '#60c8f0',
};

function getTypeColor(type) {
  return TYPE_COLORS[type] ?? '#aaaaaa';
}

export default function SpellList({ detectedSpells, onSpellHover }) {
  // Deduplicate by spell name, collecting all triples and counting occurrences
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
      <h2 style={{ color: '#ccc', borderBottom: '1px solid #444', paddingBottom: 8, marginBottom: 16, fontSize: '1.1em' }}>
        Sorts détectés ({grouped.length})
      </h2>

      {grouped.length === 0 && (
        <p style={{ color: '#666', fontStyle: 'italic' }}>
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
              padding: '10px 14px',
              marginBottom: 8,
              background: '#1e1e2e',
              borderRadius: 6,
              borderLeft: `4px solid ${color}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {count > 1 && (
                  <span style={{
                    background: color + '33',
                    border: `1px solid ${color}`,
                    color,
                    fontSize: 11,
                    fontWeight: 'bold',
                    borderRadius: 4,
                    padding: '1px 6px',
                  }}>
                    ×{count}
                  </span>
                )}
                <strong style={{ color: '#eee', fontSize: 14 }}>{spell.nom}</strong>
              </div>
              <span style={{ color, fontSize: 11, fontWeight: 'bold' }}>{spell.type}</span>
            </div>
            <div style={{ marginTop: 6 }}>
              <RuneBadges runes={spell.runes} />
            </div>
            {spell.description && (
              <div style={{ color: '#bbb', fontSize: 12, marginTop: 5, lineHeight: 1.4 }}>
                {spell.description}
              </div>
            )}
            <SpellStats spell={spell} />
            {spell.amelioration && (
              <div style={{ marginTop: 5, fontSize: 11, color: '#f0c040' }}>★ Amélioration</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
