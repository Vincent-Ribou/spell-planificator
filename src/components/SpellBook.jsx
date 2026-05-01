import { useState, useMemo } from 'react';
import RuneBadges from './RuneBadges';
import SpellStats from './SpellStats';
import { spells } from '../data/spells';
import { useTheme } from '../context/ThemeContext';

const ALL_TYPES = [...new Set(spells.map((s) => s.type))].sort();

const RUNE_SECTIONS = [
  {
    key: 'composant',
    label: 'Composant',
    colorKey: 'composant',
    runes: ['Aegis', 'Aeris', 'Ceres', 'Charas', 'Creatum', 'Cryos', 'Elementis', 'Ethas', 'Gayas', 'Geos', 'Iras', 'Lunar', 'Mystem', 'Nergis', 'Pyros', 'Solar', 'Velum'],
  },
  {
    key: 'manifestation',
    label: 'Manifestation',
    colorKey: 'manifestation',
    runes: ['Boulem', 'Cerclum', 'Conum', 'Linim', 'Persom', 'Tactim'],
  },
  {
    key: 'effet',
    label: 'Effet',
    colorKey: 'effet',
    runes: ['Altra', 'Chanta', 'Cratia', 'Destra', 'Procta'],
  },
];

export default function SpellBook() {
  const { T } = useTheme();
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

  function typeColor(type) {
    return { Divin: T.divin, Arcane: T.arcane, Céleste: T.celeste }[type] ?? T.fallbackType;
  }

  const selectStyle = {
    padding: '5px 8px',
    background: T.bgInput,
    border: `1px solid ${T.border}`,
    borderRadius: 4,
    color: T.textSecondary,
    fontSize: 12,
    cursor: 'pointer',
    width: '100%',
    fontFamily: "'Lora', serif",
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%', minHeight: 0 }}>
      <h2 style={{
        color: T.gold, fontSize: '1em', margin: '0 0 12px',
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
            background: T.bgInput, border: `1px solid ${T.border}`,
            borderRadius: 4, color: T.textPrimary, fontSize: 13,
            outline: 'none', fontFamily: "'Lora', serif",
          }}
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ ...selectStyle, width: 'auto' }}
        >
          <option value="">Tous les types</option>
          {ALL_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, width: '100%' }}>
        {RUNE_SECTIONS.map(({ key, label, colorKey, runes }) => {
          const color = T[colorKey];
          return (
            <div key={key} style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 'bold', color, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Cinzel', serif" }}>
                {label}
              </div>
              <select
                value={runeFilters[key]}
                onChange={(e) => setRuneFilter(key, e.target.value)}
                style={{ ...selectStyle, borderColor: runeFilters[key] ? color : T.border }}
              >
                <option value="">Toutes</option>
                {runes.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4, minHeight: 0 }}>
        {filtered.length === 0 && (
          <p style={{ color: T.textDim, fontStyle: 'italic', fontSize: 13 }}>Aucun résultat.</p>
        )}
        {filtered.map((spell) => {
          const color = typeColor(spell.type);
          return (
            <div
              key={spell.nom}
              style={{
                padding: '9px 12px', marginBottom: 6,
                background: T.bgCard, borderRadius: 4,
                border: `1px solid ${T.border}`, borderLeft: `3px solid ${color}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <strong style={{ color: T.textPrimary, fontSize: 13, fontFamily: "'Cinzel', serif" }}>{spell.nom}</strong>
                <span style={{ color, fontSize: 11, fontWeight: 'bold', whiteSpace: 'nowrap', fontStyle: 'italic' }}>{spell.type}</span>
              </div>
              <div style={{ marginTop: 5 }}>
                <RuneBadges runes={spell.runes} size="sm" />
              </div>
              {spell.description && (
                <div style={{ color: T.textMuted, fontSize: 11, marginTop: 4, lineHeight: 1.5, fontStyle: 'italic' }}>
                  {spell.description}
                </div>
              )}
              <SpellStats spell={spell} size="sm" />
              {spell.amelioration && (
                <div style={{ marginTop: 4, fontSize: 10, color: T.gold }}>✦ Amélioration</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
