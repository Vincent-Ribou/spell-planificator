import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { spells } from './data/spells';
import { buildAdjacencyMap, computeAllConnectedTriples } from './utils/triangleGrid';
import { buildSpellIndex, detectSpells } from './utils/spellDetector';
import { getInitialRuneMap, saveToLocalStorage, writeUrlState } from './utils/persistence';
import TriangleGrid from './components/TriangleGrid';
import RuneSelector from './components/RuneSelector';
import SpellList from './components/SpellList';
import SpellBook from './components/SpellBook';
import StatsModal from './components/StatsModal';
import { useStats } from './context/StatsContext';

// Stable precomputations — built once, never change
const adjMap = buildAdjacencyMap();
const allTriples = computeAllConnectedTriples(adjMap);
const spellIndex = buildSpellIndex(spells);

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

export default function App() {
  const [runeMap, setRuneMap] = useState(() => getInitialRuneMap());
  const [selectorState, setSelectorState] = useState(null);
  const [hoveredIds, setHoveredIds] = useState(null);
  const [copyLabel, setCopyLabel] = useState('Copier le lien');
  const [activeTab, setActiveTab] = useState('planner');
  const [showStats, setShowStats] = useState(false);
  const { stats } = useStats();
  const debounceRef = useRef(null);
  const isMobile = useIsMobile();

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

  const handleReset = useCallback(() => setRuneMap({}), []);

  const { detectedSpells, highlightedIds } = useMemo(
    () => detectSpells(runeMap, allTriples, spellIndex),
    [runeMap]
  );

  function handleTriangleClick(triangleId, clientX, clientY) {
    setSelectorState({ triangleId, x: clientX, y: clientY });
  }

  function handleRuneSelect(runeName) {
    setRuneMap((prev) => ({ ...prev, [selectorState.triangleId]: runeName }));
    setSelectorState(null);
  }

  function handleRuneClear() {
    setRuneMap((prev) => {
      const next = { ...prev };
      delete next[selectorState.triangleId];
      return next;
    });
    setSelectorState(null);
  }

  const header = (
    <div style={{
      padding: '12px 16px 10px',
      borderBottom: '1px solid #4a3510',
      flexShrink: 0,
      background: '#130f08',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
        <h1 style={{
          fontSize: '1.1em',
          margin: 0,
          color: '#c9a020',
          fontFamily: "'Cinzel', serif",
          letterSpacing: '0.04em',
          textShadow: '0 0 20px rgba(201,160,32,0.3)',
        }}>
          ✦ Planificateur de Sorts ✦
        </h1>
        <div className="no-print" style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setShowStats(true)}
            style={{
              fontSize: 11, padding: '4px 10px',
              background: '#1a1a08', border: '1px solid #5a8a30',
              borderRadius: 4, color: '#8ac060', cursor: 'pointer',
              position: 'relative', fontFamily: "'Lora', serif",
            }}
          >
            Statistiques
            {Object.values(stats).some(v => v > 0) && (
              <span style={{ position: 'absolute', top: -3, right: -3, width: 7, height: 7, background: '#8ac060', borderRadius: '50%' }} />
            )}
          </button>
          <button
            onClick={handleCopyLink}
            style={{
              fontSize: 11, padding: '4px 10px',
              background: '#1c1508', border: '1px solid #4a3510',
              borderRadius: 4, color: '#b8a070', cursor: 'pointer',
              fontFamily: "'Lora', serif",
            }}
          >
            {copyLabel}
          </button>
          <button
            onClick={handleReset}
            style={{
              fontSize: 11, padding: '4px 10px',
              background: '#1a0808', border: '1px solid #8a2020',
              borderRadius: 4, color: '#d06060', cursor: 'pointer',
              fontFamily: "'Lora', serif",
            }}
          >
            Réinitialiser
          </button>
        </div>
      </div>
      <p className="no-print" style={{ color: '#5a4828', fontSize: 11, margin: 0, fontStyle: 'italic' }}>
        Cliquez sur un triangle pour y placer une rune.
      </p>
    </div>
  );

  const plannerContent = (
    <>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #4a3510', flexShrink: 0 }}>
        <TriangleGrid
          runeMap={runeMap}
          highlightedIds={highlightedIds}
          hoveredIds={hoveredIds ? new Set(hoveredIds) : null}
          onTriangleClick={handleTriangleClick}
        />
      </div>
      <div className="print-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        <SpellList detectedSpells={detectedSpells} onSpellHover={setHoveredIds} />
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div className="app-root" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#0f0b06' }}>
        {header}
        <div className="no-print" style={{
          display: 'flex', borderBottom: '1px solid #4a3510',
          flexShrink: 0, background: '#130f08',
        }}>
          {[
            { key: 'planner', label: 'Planificateur' },
            { key: 'grimoire', label: 'Grimoire' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                flex: 1, padding: '10px 0',
                background: 'none', border: 'none',
                borderBottom: activeTab === key ? '2px solid #c9a020' : '2px solid transparent',
                color: activeTab === key ? '#c9a020' : '#5a4828',
                fontSize: 13, fontWeight: activeTab === key ? 'bold' : 'normal',
                cursor: 'pointer', borderRadius: 0,
                fontFamily: "'Cinzel', serif", letterSpacing: '0.03em',
              }}
            >
              {label}
              {key === 'planner' && detectedSpells.length > 0 && (
                <span style={{
                  marginLeft: 6, background: '#c9a020', color: '#0f0b06',
                  fontSize: 10, fontWeight: 'bold', borderRadius: 10, padding: '1px 5px',
                }}>
                  {detectedSpells.length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="print-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeTab === 'planner' ? plannerContent : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px 16px', overflow: 'hidden', minWidth: 0 }}>
              <SpellBook />
            </div>
          )}
        </div>
        <RuneSelector
          triangleId={selectorState?.triangleId ?? null}
          position={{ x: selectorState?.x ?? 0, y: selectorState?.y ?? 0 }}
          onSelect={handleRuneSelect}
          onClear={handleRuneClear}
          onClose={() => setSelectorState(null)}
        />
        {showStats && <StatsModal onClose={() => setShowStats(false)} />}
      </div>
    );
  }

  return (
    <div className="app-root" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0f0b06' }}>
      <div className="print-panel" style={{
        flex: '0 0 540px', display: 'flex', flexDirection: 'column',
        borderRight: '1px solid #4a3510', overflow: 'hidden', background: '#0f0b06',
      }}>
        {header}
        {plannerContent}
      </div>
      <div className="no-print" style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: '20px', overflow: 'hidden', minWidth: 0, background: '#0f0b06',
      }}>
        <SpellBook />
      </div>
      <RuneSelector
        triangleId={selectorState?.triangleId ?? null}
        position={{ x: selectorState?.x ?? 0, y: selectorState?.y ?? 0 }}
        onSelect={handleRuneSelect}
        onClear={handleRuneClear}
        onClose={() => setSelectorState(null)}
      />
      {showStats && <StatsModal onClose={() => setShowStats(false)} />}
    </div>
  );
}
