import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { spells } from './data/spells';
import { buildAdjacencyMap, computeAllConnectedTriples } from './utils/triangleGrid';
import { buildSpellIndex, detectSpells } from './utils/spellDetector';
import { getInitialRuneMap, saveToLocalStorage, writeUrlState } from './utils/persistence';
import TriangleGrid from './components/TriangleGrid';
import RuneSelector from './components/RuneSelector';
import SpellList from './components/SpellList';
import SpellBook from './components/SpellBook';

// Stable precomputations — built once, never change
const adjMap = buildAdjacencyMap();
const allTriples = computeAllConnectedTriples(adjMap);
const spellIndex = buildSpellIndex(spells);

export default function App() {
  const [runeMap, setRuneMap] = useState(() => getInitialRuneMap());
  const [selectorState, setSelectorState] = useState(null); // { triangleId, x, y }
  const [hoveredIds, setHoveredIds] = useState(null); // triangle IDs highlighted by spell hover
  const [copyLabel, setCopyLabel] = useState('Copier le lien');
  const debounceRef = useRef(null);

  // Persist on every runeMap change, debounced 400ms
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveToLocalStorage(runeMap);
      writeUrlState(runeMap);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [runeMap]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopyLabel('Lien copié !');
      setTimeout(() => setCopyLabel('Copier le lien'), 2000);
    });
  }, []);

  const handleReset = useCallback(() => {
    setRuneMap({});
  }, []);

  const { detectedSpells, highlightedIds } = useMemo(
    () => detectSpells(runeMap, allTriples, spellIndex),
    [runeMap]
  );

  function handleTriangleClick(triangleId, clientX, clientY) {
    setSelectorState({ triangleId, x: clientX, y: clientY });
  }

  function handleRuneSelect(runeName) {
    const { triangleId } = selectorState;
    setRuneMap((prev) => ({ ...prev, [triangleId]: runeName }));
    setSelectorState(null);
  }

  function handleRuneClear() {
    const { triangleId } = selectorState;
    setRuneMap((prev) => {
      const next = { ...prev };
      delete next[triangleId];
      return next;
    });
    setSelectorState(null);
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* Left panel: triangle + detected spells */}
      <div className="print-panel" style={{
        flex: '0 0 540px',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #333',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #333' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <h1 style={{ fontSize: '1.4em', margin: 0, color: '#eee' }}>Planificateur de Sorts</h1>
            <div className="no-print" style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={handleCopyLink}
                style={{ fontSize: 11, padding: '4px 10px', background: '#2a2a3e', border: '1px solid #555', borderRadius: 5, color: '#ccc', cursor: 'pointer' }}
              >
                {copyLabel}
              </button>
              <button
                onClick={handleReset}
                style={{ fontSize: 11, padding: '4px 10px', background: '#3a1f1f', border: '1px solid #7a3a3a', borderRadius: 5, color: '#f08080', cursor: 'pointer' }}
              >
                Réinitialiser
              </button>
            </div>
          </div>
          <p className="no-print" style={{ color: '#888', fontSize: 12, margin: 0 }}>Cliquez sur un triangle pour y placer une rune.</p>
        </div>

        <div style={{ padding: '16px 20px', borderBottom: '1px solid #333' }}>
          <TriangleGrid
            runeMap={runeMap}
            highlightedIds={highlightedIds}
            hoveredIds={hoveredIds ? new Set(hoveredIds) : null}
            onTriangleClick={handleTriangleClick}
          />
        </div>

        <div className="print-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
          <SpellList detectedSpells={detectedSpells} onSpellHover={setHoveredIds} />
        </div>
      </div>

      {/* Right panel: full spell book */}
      <div className="no-print" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', overflow: 'hidden', minWidth: 0 }}>
        <SpellBook />
      </div>

      <RuneSelector
        triangleId={selectorState?.triangleId ?? null}
        position={{ x: selectorState?.x ?? 0, y: selectorState?.y ?? 0 }}
        onSelect={handleRuneSelect}
        onClear={handleRuneClear}
        onClose={() => setSelectorState(null)}
      />
    </div>
  );
}
