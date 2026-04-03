/**
 * Resolves a spell field value by substituting character stats.
 * Returns { resolved, formula } where:
 *   - resolved: the computed string to display prominently
 *   - formula:  the original formula string (shown smaller), or null if unchanged
 */
export function resolveField(value, stats) {
  if (!value || value === 'N/A') return { resolved: value, formula: null };

  let result = value;
  let changed = false;

  // Portée: "3 Mètres + Mesure" → "7 Mètres"
  result = result.replace(
    /(\d+)\s*[Mm]ètre(?:s)?\s*\+\s*[Mm]esure/g,
    (_, base) => {
      changed = true;
      const total = parseInt(base) + stats.mesure;
      return `${total} Mètre${total > 1 ? 's' : ''}`;
    }
  );

  // Puissance: "4 + Puissance" → "9"
  result = result.replace(
    /(\d+)\s*\+\s*[Pp]uissance[s]?/g,
    (_, base) => {
      changed = true;
      return `${parseInt(base) + stats.puissance}`;
    }
  );

  // Puissance: standalone "Puissance" (no base number)
  result = result.replace(
    /(?<!\d\s*\+\s*)(?<!\d)\bPuissance\b/g,
    () => {
      changed = true;
      return `${stats.puissance}`;
    }
  );

  // Introspection: "2 + Introspection" → "7"
  result = result.replace(
    /(\d+)\s*\+\s*[Ii]ntrospection/g,
    (_, base) => {
      changed = true;
      return `${parseInt(base) + stats.introspection}`;
    }
  );

  // Introspection: standalone
  result = result.replace(
    /(?<!\d\s*\+\s*)(?<!\d)\b[Ii]ntrospection\b/g,
    () => {
      changed = true;
      return `${stats.introspection}`;
    }
  );

  // Durée: "1 min/Persistance" → "X min" (multiply)
  result = result.replace(
    /(\d+)\s*[Mm]in(?:ute)?s?\s*\/\s*[Pp]ersistance/g,
    (_, base) => {
      changed = true;
      const total = parseInt(base) * Math.max(1, stats.persistance);
      return `${total} min`;
    }
  );

  // Durée: "5 Minutes + Persistance" → "8 Minutes" (with optional Max cap)
  result = result.replace(
    /(\d+)\s*[Mm]inute(?:s)?\s*\+\s*(?:la\s+)?[Pp]ersistance(?:[^\(]*)(\(Max\s*[\d]+\s*min(?:utes?)?\))?/g,
    (_, base, cap) => {
      changed = true;
      let total = parseInt(base) + stats.persistance;
      if (cap) {
        const maxMatch = cap.match(/(\d+)/);
        if (maxMatch) total = Math.min(total, parseInt(maxMatch[1]));
      }
      return `${total} Minute${total > 1 ? 's' : ''}${cap ? ` ${cap}` : ''}`;
    }
  );

  // Durée: "1 Minute + Persistance (Max X minutes)" — same pattern but 1 min base
  // Already handled above.

  // "5 Mètres + Persistance" (rare edge case in duree)
  result = result.replace(
    /(\d+)\s*[Mm]ètres?\s*\+\s*[Pp]ersistance/g,
    (_, base) => {
      changed = true;
      return `${parseInt(base) + stats.persistance} Mètres`;
    }
  );

  return {
    resolved: result,
    formula: changed ? value : null,
  };
}

export function resolveSpell(spell, stats) {
  return {
    puissance: resolveField(spell.puissance, stats),
    portee:    resolveField(spell.portee,    stats),
    duree:     resolveField(spell.duree,     stats),
  };
}
