const LS_KEY = 'spellPlanificator_runeMap';
const URL_PARAM = 'g';

// --- Encoding ---

export function encodeRuneMap(runeMap) {
  if (Object.keys(runeMap).length === 0) return '';
  // Compact format: "r-j:RuneName" joined by commas
  const str = Object.entries(runeMap)
    .map(([id, rune]) => `${id}:${rune}`)
    .join(',');
  return btoa(str);
}

export function decodeRuneMap(encoded) {
  try {
    const str = atob(encoded);
    return Object.fromEntries(
      str.split(',').map((entry) => {
        const colon = entry.indexOf(':');
        return [entry.slice(0, colon), entry.slice(colon + 1)];
      })
    );
  } catch {
    return null;
  }
}

// --- URL ---

export function writeUrlState(runeMap) {
  const encoded = encodeRuneMap(runeMap);
  const url = new URL(window.location.href);
  if (encoded) {
    url.searchParams.set(URL_PARAM, encoded);
  } else {
    url.searchParams.delete(URL_PARAM);
  }
  window.history.replaceState(null, '', url.toString());
}

export function readUrlState() {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get(URL_PARAM);
  if (!encoded) return null;
  return decodeRuneMap(encoded);
}

// --- localStorage ---

export function saveToLocalStorage(runeMap) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(runeMap));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// --- Initial state: URL takes priority over localStorage ---

export function getInitialRuneMap() {
  return readUrlState() ?? loadFromLocalStorage() ?? {};
}
