import { useTheme } from '../context/ThemeContext';

export default function RuneBadges({ runes, size = 'md' }) {
  const { T } = useTheme();
  const fontSize = size === 'sm' ? 10 : 12;
  const padding  = size === 'sm' ? '2px 6px' : '3px 9px';
  const colorKeys = ['composant', 'manifestation', 'effet'];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
      {runes.map((rune, i) => {
        const color = T[colorKeys[i]] ?? T.fallbackType;
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
