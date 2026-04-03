import { useStats } from '../context/StatsContext';
import { resolveSpell } from '../utils/resolveSpellValues';

export default function SpellStats({ spell, size = 'md' }) {
  const { stats } = useStats();
  const resolved = resolveSpell(spell, stats);
  const fontSize = size === 'sm' ? 10 : 11;
  const formulaSize = size === 'sm' ? 9 : 10;

  function StatItem({ icon, field }) {
    const { resolved: value, formula } = field;
    if (!value || value === 'N/A') return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ color: '#888', fontSize }}>{icon} {value}</span>
        {formula && (
          <span style={{ color: '#555', fontSize: formulaSize, marginTop: 1 }}>{formula}</span>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 5, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <StatItem icon="⚡" field={resolved.puissance} />
      <StatItem icon="📏" field={resolved.portee} />
      <StatItem icon="⏱" field={resolved.duree} />
      {spell.region && (
        <span style={{ color: '#888', fontSize }}>🎯 {spell.region}</span>
      )}
    </div>
  );
}
