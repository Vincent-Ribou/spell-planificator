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
import { useTheme } from './context/ThemeContext';

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
  const { T, isDark, toggle } = useTheme();
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

  const themeBtn = (
    <button
      onClick={toggle}
      title={isDark ? 'Passer au thème clair' : 'Passer au thème sombre'}
      style={{
        fontSize: 11, width: 28,
        padding: '4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: T.bgCard, border: `1px solid ${T.border}`,
        borderRadius: 4, color: T.textMuted, cursor: 'pointer',
        fontFamily: "'Lora', serif", lineHeight: 1, flexShrink: 0,
      }}
    >
      {isDark ? '☀' : '☽'}
    </button>
  );

  const header = (
    <div className="print-header" style={{
      padding: '12px 16px 10px',
      borderBottom: `1px solid ${T.border}`,
      flexShrink: 0,
      background: T.bgPanel,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? 8 : 2 }}>
        <h1 style={{
          fontSize: '1.1em', margin: 0, color: T.gold,
          fontFamily: "'Cinzel', serif", letterSpacing: '0.04em',
          textShadow: isDark ? '0 0 20px rgba(201,160,32,0.3)' : 'none',
        }}>
          ✦ Planificateur de Sorts ✦
        </h1>
        <div className="no-print" style={{ display: 'flex', gap: 6 }}>
          {themeBtn}
          {!isMobile && (
            <>
          <button
            onClick={() => setShowStats(true)}
            style={{
              fontSize: 11, padding: '4px 10px',
              background: T.greenBg, border: `1px solid ${T.greenBorder}`,
              borderRadius: 4, color: T.greenText, cursor: 'pointer',
              position: 'relative', fontFamily: "'Lora', serif",
            }}
          >
            Statistiques
            {Object.values(stats).some(v => v > 0) && (
              <span style={{ position: 'absolute', top: -3, right: -3, width: 7, height: 7, background: T.greenText, borderRadius: '50%' }} />
            )}
          </button>
          <button
            onClick={handleCopyLink}
            style={{
              fontSize: 11, padding: '4px 10px',
              background: T.bgCard, border: `1px solid ${T.border}`,
              borderRadius: 4, color: T.textSecondary, cursor: 'pointer',
              fontFamily: "'Lora', serif",
            }}
          >
            {copyLabel}
          </button>
          <button
            onClick={handleReset}
            style={{
              fontSize: 11, padding: '4px 10px',
              background: T.redBg, border: `1px solid ${T.redBorder}`,
              borderRadius: 4, color: T.redText, cursor: 'pointer',
              fontFamily: "'Lora', serif",
            }}
          >
            Réinitialiser
          </button>
          {['portrait', 'landscape'].map((orientation) => (
            <button
              key={orientation}
              onClick={() => {
                const s = document.createElement('style');
                s.textContent = `@page { size: ${orientation}; }`;
                document.head.appendChild(s);
                document.documentElement.classList.add(`force-print-${orientation}`);
                window.print();
                document.documentElement.classList.remove(`force-print-${orientation}`);
                document.head.removeChild(s);
              }}
              style={{
                fontSize: 11, padding: '4px 10px',
                background: T.bgCard, border: `1px solid ${T.border}`,
                borderRadius: 4, color: T.textSecondary, cursor: 'pointer',
                fontFamily: "'Lora', serif",
              }}
            >
              🖨 {orientation === 'portrait' ? 'Portrait' : 'Paysage'}
            </button>
          ))}
            </>
          )}
        </div>
      </div>
      {isMobile && (
        <div className="no-print" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowStats(true)}
            style={{
              fontSize: 11, padding: '4px 10px',
              background: T.greenBg, border: `1px solid ${T.greenBorder}`,
              borderRadius: 4, color: T.greenText, cursor: 'pointer',
              position: 'relative', fontFamily: "'Lora', serif",
            }}
          >
            Statistiques
            {Object.values(stats).some(v => v > 0) && (
              <span style={{ position: 'absolute', top: -3, right: -3, width: 7, height: 7, background: T.greenText, borderRadius: '50%' }} />
            )}
          </button>
          <button
            onClick={handleCopyLink}
            style={{
              fontSize: 11, padding: '4px 10px',
              background: T.bgCard, border: `1px solid ${T.border}`,
              borderRadius: 4, color: T.textSecondary, cursor: 'pointer',
              fontFamily: "'Lora', serif",
            }}
          >
            {copyLabel}
          </button>
          <button
            onClick={handleReset}
            style={{
              fontSize: 11, padding: '4px 10px',
              background: T.redBg, border: `1px solid ${T.redBorder}`,
              borderRadius: 4, color: T.redText, cursor: 'pointer',
              fontFamily: "'Lora', serif",
            }}
          >
            Réinitialiser
          </button>
        </div>
      )}
      <p className="no-print" style={{ color: T.textDim, fontSize: 11, margin: isMobile ? '6px 0 0' : 0, fontStyle: 'italic' }}>
        Cliquez sur un triangle pour y placer une rune.
      </p>
    </div>
  );

  const plannerContent = (
    <>
      <div className="print-triangle" style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
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
      <div className="app-root" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: T.bgPage }}>
        {header}
        <div className="no-print" style={{
          display: 'flex', borderBottom: `1px solid ${T.border}`,
          flexShrink: 0, background: T.bgPanel,
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
                borderBottom: activeTab === key ? `2px solid ${T.tabActiveBorder}` : '2px solid transparent',
                color: activeTab === key ? T.tabActiveColor : T.tabInactiveColor,
                fontSize: 13, fontWeight: activeTab === key ? 'bold' : 'normal',
                cursor: 'pointer', borderRadius: 0,
                fontFamily: "'Cinzel', serif", letterSpacing: '0.03em',
              }}
            >
              {label}
              {key === 'planner' && detectedSpells.length > 0 && (
                <span style={{
                  marginLeft: 6, background: T.tabBadgeBg, color: T.tabBadgeText,
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
    <div className="app-root" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: T.bgPage }}>
      {header}
      <div className="print-main-row" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div className="print-panel" style={{
          flex: '0 0 540px', display: 'flex', flexDirection: 'column',
          borderRight: `1px solid ${T.border}`, overflow: 'hidden', background: T.bgPage,
        }}>
          {plannerContent}
        </div>
        <div className="no-print" style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          padding: '20px', overflow: 'hidden', minWidth: 0, background: T.bgPage,
        }}>
          <SpellBook />
        </div>
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
