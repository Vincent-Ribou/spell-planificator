import { useMemo } from 'react';
import { W, H, getVertices, getCentroid, getAllTriangleIds } from '../utils/triangleGrid';
import { runes } from '../data/spells';
import { useTheme } from '../context/ThemeContext';

const RUNE_COLORS = Object.fromEntries(
  runes.map((rune, i) => [rune, `hsl(${Math.round(i * 360 / runes.length)}, 55%, 48%)`])
);

export default function TriangleGrid({ runeMap, highlightedIds, hoveredIds, onTriangleClick }) {
  const { T } = useTheme();

  const triangles = useMemo(() => {
    return getAllTriangleIds().map((id) => {
      const [r, j] = id.split('-').map(Number);
      const verts = getVertices(r, j);
      const centroid = getCentroid(r, j);
      const points = verts.map(([x, y]) => `${x},${y}`).join(' ');
      return { id, r, j, points, centroid };
    });
  }, []);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: 'block', width: '100%', height: 'auto' }}
    >
      {triangles.map(({ id, points, centroid }) => {
        const isHovered    = hoveredIds?.has(id) ?? false;
        const isHighlighted = highlightedIds.has(id);
        const rune = runeMap[id];

        let fill, stroke, textFill;
        if (isHovered) {
          fill = T.triangleHover;
          stroke = T.triangleHoverStroke;
          textFill = T.triangleHoverText;
        } else if (isHighlighted) {
          fill = T.triangleHighlight;
          stroke = T.triangleHighlightStroke;
          textFill = T.triangleHighlightText;
        } else if (rune) {
          fill = RUNE_COLORS[rune] ?? T.fallbackType;
          stroke = T.triangleStroke;
          textFill = T.triangleText;
        } else {
          fill = T.triangleEmpty;
          stroke = T.triangleStroke;
          textFill = T.triangleText;
        }

        return (
          <g
            key={id}
            onClick={(e) => onTriangleClick(id, e.clientX, e.clientY)}
            style={{ cursor: 'pointer' }}
          >
            <polygon
              points={points}
              fill={fill}
              stroke={stroke}
              strokeWidth={isHovered || isHighlighted ? 2 : 1}
            />
            {rune && (
              <text
                x={centroid[0]}
                y={centroid[1]}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={8}
                fontWeight="bold"
                fill={textFill}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {rune}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
