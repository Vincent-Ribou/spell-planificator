// Colors match rune categories: composant, manifestation, effet
const RUNE_CATEGORY_COLORS = ['#6aabcf', '#5ab880', '#c9a020'];

export default function RuneBadges({ runes, size = 'md' }) {
  const fontSize = size === 'sm' ? 10 : 12;
  const padding  = size === 'sm' ? '2px 6px' : '3px 9px';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
      {runes.map((rune, i) => {
        const color = RUNE_CATEGORY_COLORS[i] ?? '#8a7050';
        return (
          <span
            key={i}
            style={{
              fontSize, fontWeight: 'bold', padding, borderRadius: 3,
              background: color + '18', border: `1px solid ${color}66`,
              color, letterSpacing: '0.03em', fontFamily: "'Lora', serif",
            }}
          >
            {rune}
          </span>
        );
      })}
    </div>
  );
}
