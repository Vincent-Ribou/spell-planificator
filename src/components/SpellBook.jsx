import { useState, useMemo } from 'react';
import RuneBadges from './RuneBadges';
import SpellStats from './SpellStats';
import { spells } from '../data/spells';

const TYPE_COLORS = {
  Divin:   '#d4a017',
  Arcane:  '#9060d0',
  Céleste: '#4aabdc',
};

const ALL_TYPES = [...new Set(spells.map((s) => s.type))].sort();

const RUNE_SECTIONS = [
  {
    key: 'composant',
    label: 'Composant',
    color: '#6aabcf',
    runes: ['Aegis', 'Aeris', 'Ceres', 'Charas', 'Creatum', 'Cryos', 'Elementis', 'Ethas', 'Gayas', 'Geos', 'Iras', 'Lunar', 'Mystem', 'Nergis', 'Pyros', 'Solar', 'Velum'],
    position: 0,
  },
  {
    key: 'manifestation',
    label: 'Manifestation',
    color: '#5ab880',
    runes: ['Boulem', 'Cerclum', 'Conum', 'Linim', 'Persom', 'Tactim'],
    position: 1,
  },
  {
    key: 'effet',
    label: 'Effet',
    color: '#c9a020',
    runes: ['Altra', 'Chanta', 'Cratia', 'Destra', 'Procta'],
    position: 2,
  },
];

const SELECT_STYLE = {
  padding: '5px 8px',
  background: '#170f05',
  border: '1px solid #4a3510',
  borderRadius: 4,
  color: '#b8a070',
  fontSize: 12,
  cursor: 'pointer',
  width: '100%',
  fontFamily: "'Lora', serif",
};

export default function SpellBook() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [runeFilters, setRuneFilters] = useState({ composant: '', manifestation: '', effet: '' });

  function setRuneFilter(key, value) {
    setRuneFilters((prev) => ({ ...prev, [key]: value }));
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return spells.filter((s) => {
      if (typeFilter && s.type !== typeFilter) return false;
      if (runeFilters.composant     && s.runes[0] !== runeFilters.composant)     return false;
      if (runeFilters.manifestation && s.runes[1] !== runeFilters.manifestation) return false;
      if (runeFilters.effet         && s.runes[2] !== runeFilters.effet)         return false;
      if (!q) return true;
      return (
        s.nom.toLowerCase().includes(q) ||
        s.runes.some((r) => r.toLowerCase().includes(q)) ||
        s.description?.toLowerCase().includes(q)
      );
    });
  }, [search, typeFilter, runeFilters]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%', minHeight: 0 }}>
      <h2 style={{
        color: '#c9a020', fontSize: '1em', margin: '0 0 12px',
        fontFamily: "'Cinzel', serif", letterSpacing: '0.05em',
      }}>
        Grimoire ({filtered.length} / {spells.length})
      </h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8, width: '100%' }}>
        <input
          type="text"
          placeholder="Rechercher un sort, une rune…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1, padding: '6px 10px',
            background: '#170f05', border: '1px solid #4a3510',
            borderRadius: 4, color: '#e8d5a0', fontSize: 13,
            outline: 'none', fontFamily: "'Lora', serif",
          }}
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ ...SELECT_STYLE, width: 'auto' }}
        >
          <option value="">Tous les types</option>
          {ALL_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, width: '100%' }}>
        {RUNE_SECTIONS.map(({ key, label, color, runes }) => (
          <div key={key} style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 'bold', color, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Cinzel', serif" }}>
              {label}
            </div>
            <select
              value={runeFilters[key]}
              onChange={(e) => setRuneFilter(key, e.target.value)}
              style={{ ...SELECT_STYLE, borderColor: runeFilters[key] ? color : '#4a3510' }}
            >
              <option value="">Toutes</option>
              {runes.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4, minHeight: 0 }}>
        {filtered.length === 0 && (
          <p style={{ color: '#5a4828', fontStyle: 'italic', fontSize: 13 }}>Aucun résultat.</p>
        )}
        {filtered.map((spell) => {
          const color = TYPE_COLORS[spell.type] ?? '#8a7050';
          return (
            <div
              key={spell.nom}
              style={{
                padding: '9px 12px', marginBottom: 6,
                background: '#1c1508', borderRadius: 4,
                border: '1px solid #3a2a10', borderLeft: `3px solid ${color}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <strong style={{ color: '#e8d5a0', fontSize: 13, fontFamily: "'Cinzel', serif" }}>{spell.nom}</strong>
                <span style={{ color, fontSize: 11, fontWeight: 'bold', whiteSpace: 'nowrap', fontStyle: 'italic' }}>{spell.type}</span>
              </div>
              <div style={{ marginTop: 5 }}>
                <RuneBadges runes={spell.runes} size="sm" />
              </div>
              {spell.description && (
                <div style={{ color: '#8a7050', fontSize: 11, marginTop: 4, lineHeight: 1.5, fontStyle: 'italic' }}>
                  {spell.description}
                </div>
              )}
              <SpellStats spell={spell} size="sm" />
              {spell.amelioration && (
                <div style={{ marginTop: 4, fontSize: 10, color: '#c9a020' }}>✦ Amélioration</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
