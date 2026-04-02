import { useMemo } from 'react';
import { W, H, getVertices, getCentroid, getAllTriangleIds } from '../utils/triangleGrid';
import { runes } from '../data/spells';

// Pre-build a color map for each rune (stable, index-based)
const RUNE_COLORS = Object.fromEntries(
  runes.map((rune, i) => [rune, `hsl(${Math.round(i * 360 / runes.length)}, 65%, 55%)`])
);

function getTriangleFill(id, runeMap, highlightedIds, hoveredIds) {
  if (hoveredIds?.has(id)) return 'hsl(195, 90%, 60%)';
  if (highlightedIds.has(id)) return 'hsl(45, 90%, 55%)';
  const rune = runeMap[id];
  if (rune) return RUNE_COLORS[rune] ?? '#aaa';
  return '#e8e8e8';
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
              stroke={isHovered ? '#0090b0' : isHighlighted ? '#c07000' : '#666'}
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
                fill={isHovered ? '#003040' : isHighlighted ? '#3a1f00' : '#111'}
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
