// Colors match RuneSelector categories
const RUNE_CATEGORY_COLORS = ['#7ec8e3', '#6dd9a0', '#f0b060']; // composant, manifestation, effet

export default function RuneBadges({ runes, size = 'md' }) {
  const fontSize = size === 'sm' ? 10 : 12;
  const padding  = size === 'sm' ? '2px 6px' : '3px 9px';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
      {runes.map((rune, i) => {
        const color = RUNE_CATEGORY_COLORS[i] ?? '#aaa';
        return (
          <span
            key={i}
            style={{
              fontSize,
              fontWeight: 'bold',
              padding,
              borderRadius: 4,
              background: color + '22',
              border: `1px solid ${color}88`,
              color,
              letterSpacing: '0.02em',
            }}
          >
            {rune}
          </span>
        );
      })}
    </div>
  );
}
