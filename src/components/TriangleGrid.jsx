import { useMemo } from 'react';
import { W, H, getVertices, getCentroid, getAllTriangleIds } from '../utils/triangleGrid';
import { runes } from '../data/spells';

const RUNE_COLORS = Object.fromEntries(
  runes.map((rune, i) => [rune, `hsl(${Math.round(i * 360 / runes.length)}, 55%, 48%)`])
);

function getTriangleFill(id, runeMap, highlightedIds, hoveredIds) {
  if (hoveredIds?.has(id)) return 'hsl(200, 65%, 38%)';
  if (highlightedIds.has(id)) return 'hsl(42, 90%, 58%)';
  const rune = runeMap[id];
  if (rune) return RUNE_COLORS[rune] ?? '#6a5020';
  return '#2a1e0c';
}

export default function TriangleGrid({ runeMap, highlightedIds, hoveredIds, onTriangleClick }) {
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
        const isHovered = hoveredIds?.has(id) ?? false;
        const fill = getTriangleFill(id, runeMap, highlightedIds, hoveredIds);
        const rune = runeMap[id];
        const isHighlighted = highlightedIds.has(id);
        return (
          <g
            key={id}
            onClick={(e) => onTriangleClick(id, e.clientX, e.clientY)}
            style={{ cursor: 'pointer' }}
          >
            <polygon
              points={points}
              fill={fill}
              stroke={isHovered ? '#0a4060' : isHighlighted ? '#7a5200' : '#6a4e20'}
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
                fill={isHovered ? '#e8f4ff' : isHighlighted ? '#1a0e00' : '#e8d5a0'}
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
