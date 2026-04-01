export const N = 5;
export const W = 500;
export const H = W * Math.sqrt(3) / 2;
export const unit = W / (2 * N);
export const h = H / N;

/**
 * Returns the 3 SVG vertices [[x,y], [x,y], [x,y]] of triangle (r, j).
 * j even = upward; j odd = downward.
 */
export function getVertices(r, j) {
  if (j % 2 === 0) {
    const k = j / 2;
    return [
      [W / 2 + (2 * k - r) * unit,     r * h],           // top
      [W / 2 + (2 * k - r - 1) * unit, (r + 1) * h],     // bottom-left
      [W / 2 + (2 * k - r + 1) * unit, (r + 1) * h],     // bottom-right
    ];
  } else {
    const k = (j - 1) / 2;
    return [
      [W / 2 + (2 * k - r) * unit,     r * h],           // top-left
      [W / 2 + (2 * k - r + 2) * unit, r * h],           // top-right
      [W / 2 + (2 * k - r + 1) * unit, (r + 1) * h],     // bottom
    ];
  }
}

/** Returns the centroid [x, y] of triangle (r, j). */
export function getCentroid(r, j) {
  const verts = getVertices(r, j);
  return [
    (verts[0][0] + verts[1][0] + verts[2][0]) / 3,
    (verts[0][1] + verts[1][1] + verts[2][1]) / 3,
  ];
}

/** Returns array of adjacent triangle IDs for triangle (r, j). */
export function getAdjacentIds(r, j) {
  const adj = [];
  if (j > 0)     adj.push(`${r}-${j - 1}`);
  if (j < 2 * r) adj.push(`${r}-${j + 1}`);
  if (j % 2 === 0) {
    if (r < N - 1) adj.push(`${r + 1}-${j + 1}`);
  } else {
    if (r > 0) adj.push(`${r - 1}-${j - 1}`);
  }
  return adj;
}

/** Builds and returns a Map<triangleId, string[]> of all adjacencies. */
export function buildAdjacencyMap() {
  const map = new Map();
  for (let r = 0; r < N; r++) {
    for (let j = 0; j <= 2 * r; j++) {
      const id = `${r}-${j}`;
      map.set(id, getAdjacentIds(r, j));
    }
  }
  return map;
}

/**
 * Returns all connected triples (paths of 3) as [a, b, c] where b is always
 * the middle node (adjacent to both a and c). Each undirected path is stored once.
 */
export function computeAllConnectedTriples(adjMap) {
  const seen = new Set();
  const triples = [];
  for (const [b, bNeighbors] of adjMap) {
    for (const a of bNeighbors) {
      for (const c of bNeighbors) {
        if (a === c) continue;
        // Canonical key: smaller endpoint first, middle always b
        const key = `${a < c ? a : c}|${b}|${a < c ? c : a}`;
        if (!seen.has(key)) {
          seen.add(key);
          triples.push([a, b, c]);
        }
      }
    }
  }
  return triples;
}

/** Returns all triangle IDs in reading order (row by row). */
export function getAllTriangleIds() {
  const ids = [];
  for (let r = 0; r < N; r++) {
    for (let j = 0; j <= 2 * r; j++) {
      ids.push(`${r}-${j}`);
    }
  }
  return ids;
}
