import { useState, useMemo } from 'react';
import RuneBadges from './RuneBadges';
import SpellStats from './SpellStats';
import { spells } from '../data/spells';

const TYPE_COLORS = {
  Divin:   '#f0c040',
  Arcane:  '#a070f0',
  Céleste: '#60c8f0',
};

const ALL_TYPES = [...new Set(spells.map((s) => s.type))].sort();

const RUNE_SECTIONS = [
  {
    key: 'composant',
    label: 'Composant',
    color: '#7ec8e3',
    runes: ['Aegis', 'Aeris', 'Ceres', 'Charas', 'Creatum', 'Cryos', 'Elementis', 'Ethas', 'Gayas', 'Geos', 'Iras', 'Lunar', 'Mystem', 'Nergis', 'Pyros', 'Solar', 'Velum'],
    position: 0,
  },
  {
    key: 'manifestation',
    label: 'Manifestation',
    color: '#6dd9a0',
    runes: ['Boulem', 'Cerclum', 'Conum', 'Linim', 'Persom', 'Tactim'],
    position: 1,
  },
  {
    key: 'effet',
    label: 'Effet',
    color: '#f0b060',
    runes: ['Altra', 'Chanta', 'Cratia', 'Destra', 'Procta'],
    position: 2,
  },
];

const SELECT_STYLE = {
  padding: '5px 8px',
  background: '#2a2a3e',
  border: '1px solid #555',
  borderRadius: 5,
  color: '#eee',
  fontSize: 12,
  cursor: 'pointer',
  width: '100%',
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
      if (runeFilters.composant    && s.runes[0] !== runeFilters.composant)    return false;
      if (runeFilters.manifestation && s.runes[1] !== runeFilters.manifestation) return false;
      if (runeFilters.effet        && s.runes[2] !== runeFilters.effet)        return false;
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
      <h2 style={{ color: '#ccc', fontSize: '1.1em', margin: '0 0 12px' }}>
        Grimoire ({filtered.length} / {spells.length})
      </h2>

      {/* Text search + type filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, width: '100%' }}>
        <input
          type="text"
          placeholder="Rechercher un sort, une rune…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: '6px 10px',
            background: '#2a2a3e',
            border: '1px solid #555',
            borderRadius: 5,
            color: '#eee',
            fontSize: 13,
            outline: 'none',
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

      {/* Rune filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, width: '100%' }}>
        {RUNE_SECTIONS.map(({ key, label, color, runes }) => (
          <div key={key} style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 'bold', color, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {label}
            </div>
            <select
              value={runeFilters[key]}
              onChange={(e) => setRuneFilter(key, e.target.value)}
              style={{ ...SELECT_STYLE, borderColor: runeFilters[key] ? color : '#555' }}
            >
              <option value="">Toutes</option>
              {runes.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Spell list */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4, minHeight: 0 }}>
        {filtered.length === 0 && (
          <p style={{ color: '#666', fontStyle: 'italic', fontSize: 13 }}>Aucun résultat.</p>
        )}
        {filtered.map((spell) => {
          const color = TYPE_COLORS[spell.type] ?? '#aaa';
          return (
            <div
              key={spell.nom}
              style={{
                padding: '9px 12px',
                marginBottom: 6,
                background: '#1e1e2e',
                borderRadius: 6,
                borderLeft: `3px solid ${color}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <strong style={{ color: '#eee', fontSize: 13 }}>{spell.nom}</strong>
                <span style={{ color, fontSize: 11, fontWeight: 'bold', whiteSpace: 'nowrap' }}>{spell.type}</span>
              </div>
              <div style={{ marginTop: 5 }}>
                <RuneBadges runes={spell.runes} size="sm" />
              </div>
              {spell.description && (
                <div style={{ color: '#aaa', fontSize: 11, marginTop: 4, lineHeight: 1.4 }}>
                  {spell.description}
                </div>
              )}
              <SpellStats spell={spell} size="sm" />
              {spell.amelioration && (
                <div style={{ marginTop: 4, fontSize: 10, color: '#f0c040' }}>★ Amélioration</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
