/**
 * Builds a Map<spellKey, spell[]> for O(1) spell lookup.
 * Key format: "Manifestation|ComposantOrEffet1|ComposantOrEffet2"
 * where runes[1] is always Manifestation (middle), runes[0]/[2] are the ends (sorted).
 */
export function buildSpellIndex(spells) {
  const index = new Map();
  for (const spell of spells) {
    const [composant, manifestation, effet] = spell.runes;
    const key = `${manifestation}|${[composant, effet].sort().join('|')}`;
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(spell);
  }
  return index;
}

/**
 * Scans all precomputed connected triples and returns detected spells.
 * A spell is valid only when the middle triangle holds a Manifestation rune
 * and the two end triangles hold the matching Composant and Effet runes.
 *
 * @param {Object} runeMap    - { [triangleId]: runeName }
 * @param {Array}  allTriples - [a, b, c] where b is always the middle node
 * @param {Map}    spellIndex - built by buildSpellIndex()
 * @returns {{ detectedSpells: Array, highlightedIds: Set }}
 */
export function detectSpells(runeMap, allTriples, spellIndex) {
  const detectedSpells = [];
  const highlightedIds = new Set();

  for (const [a, b, c] of allTriples) {
    const runeA = runeMap[a];
    const runeB = runeMap[b]; // must be Manifestation
    const runeC = runeMap[c];
    if (!runeA || !runeB || !runeC) continue;

    // Middle rune (b) must be the Manifestation; ends (a, c) are Composant + Effet
    const key = `${runeB}|${[runeA, runeC].sort().join('|')}`;
    const matched = spellIndex.get(key);
    if (matched) {
      for (const spell of matched) {
        detectedSpells.push({ spell, triple: [a, b, c] });
      }
      highlightedIds.add(a);
      highlightedIds.add(b);
      highlightedIds.add(c);
    }
  }

  return { detectedSpells, highlightedIds };
}
