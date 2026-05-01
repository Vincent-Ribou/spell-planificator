import { forwardRef, useRef, useState, useLayoutEffect, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';

// Notch config per edge: p=position (0-1), d=depth px, hw=half-width px
const NOTCH = {
  top:    [{ p: 0.17, d: 5,  hw: 4 }, { p: 0.44, d: 12, hw: 7 }, { p: 0.71, d: 8,  hw: 5 }],
  right:  [{ p: 0.25, d: 10, hw: 5 }, { p: 0.52, d: 5,  hw: 6 }, { p: 0.78, d: 13, hw: 4 }],
  bottom: [{ p: 0.75, d: 7,  hw: 6 }, { p: 0.51, d: 11, hw: 5 }, { p: 0.24, d: 4,  hw: 8 }],
  left:   [{ p: 0.70, d: 8,  hw: 5 }, { p: 0.46, d: 13, hw: 4 }, { p: 0.21, d: 6,  hw: 6 }],
};

// Wobble amplitudes [at-33%, at-67%] cycling per inter-notch segment
const WAMP = [[2, 1], [3, 1.5], [2, 3], [1.5, 2.5]];

const ff = (n) => +n.toFixed(1);

function buildShape(w, h) {
  if (!w || !h) return null;
  const pts = [];
  const wa = (i) => WAMP[i % WAMP.length];

  // TOP: left→right, base y=0, wobble/notches push DOWN (+y)
  pts.push([0, 0]);
  let px = 0;
  NOTCH.top.forEach(({ p, d, hw }, i) => {
    const nx = p * w, ex = nx - hw;
    const [a, b] = wa(i);
    pts.push([px + (ex - px) * 0.33, a], [px + (ex - px) * 0.67, b]);
    pts.push([ex, 0], [nx, d], [nx + hw, 0]);
    px = nx + hw;
  });
  { const [a, b] = wa(3); pts.push([px + (w - px) * 0.33, a], [px + (w - px) * 0.67, b]); }
  pts.push([w, 0]);

  // RIGHT: top→bottom, base x=w, wobble/notches push LEFT (w - amp)
  let py = 0;
  NOTCH.right.forEach(({ p, d, hw }, i) => {
    const ny = p * h, ey = ny - hw;
    const [a, b] = wa(i);
    pts.push([w - a, py + (ey - py) * 0.33], [w - b, py + (ey - py) * 0.67]);
    pts.push([w, ey], [w - d, ny], [w, ny + hw]);
    py = ny + hw;
  });
  { const [a, b] = wa(3); pts.push([w - a, py + (h - py) * 0.33], [w - b, py + (h - py) * 0.67]); }
  pts.push([w, h]);

  // BOTTOM: right→left, base y=h, wobble/notches push UP (h - amp)
  px = w;
  NOTCH.bottom.forEach(({ p, d, hw }, i) => {
    const nx = p * w, ex = nx + hw;
    const [a, b] = wa(i);
    pts.push([px + (ex - px) * 0.33, h - a], [px + (ex - px) * 0.67, h - b]);
    pts.push([ex, h], [nx, h - d], [nx - hw, h]);
    px = nx - hw;
  });
  { const [a, b] = wa(3); pts.push([px + (0 - px) * 0.33, h - a], [px + (0 - px) * 0.67, h - b]); }
  pts.push([0, h]);

  // LEFT: bottom→top, base x=0, wobble/notches push RIGHT (+x)
  py = h;
  NOTCH.left.forEach(({ p, d, hw }, i) => {
    const ny = p * h, ey = ny + hw;
    const [a, b] = wa(i);
    pts.push([a, py + (ey - py) * 0.33], [b, py + (ey - py) * 0.67]);
    pts.push([0, ey], [d, ny], [0, ny - hw]);
    py = ny - hw;
  });
  { const [a, b] = wa(3); pts.push([a, py + (0 - py) * 0.33], [b, py + (0 - py) * 0.67]); }
  // polygon closes back to [0,0] automatically

  const clipPath = 'polygon(' + pts.map(([x, y]) => `${ff(x)}px ${ff(y)}px`).join(',') + ')';
  const svgPath  = 'M' + pts.map(([x, y]) => `${ff(x)},${ff(y)}`).join('L') + 'Z';
  return { clipPath, svgPath };
}

// Props that belong on the outer wrapper (layout), not the clipped content div
const LAYOUT_KEYS = new Set([
  'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'flex', 'flexGrow', 'flexShrink', 'flexBasis', 'alignSelf', 'justifySelf',
  'position', 'top', 'right', 'bottom', 'left', 'zIndex',
  'width', 'maxWidth', 'minWidth', 'height', 'maxHeight', 'minHeight',
  'float', 'clear', 'gridArea', 'gridColumn', 'gridRow',
]);

const RoughBox = forwardRef(function RoughBox({ children, style = {}, className }, fwdRef) {
  const { T } = useTheme();
  const wrapRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    // Read synchronously to avoid first-frame flash
    setSize({ w: Math.round(el.offsetWidth), h: Math.round(el.offsetHeight) });
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const shape = useMemo(() => buildShape(size.w, size.h), [size.w, size.h]);

  // Split styles: layout props on wrapper, visual props on clipped content div
  const wrapStyle = { position: 'relative' };
  const contentStyle = {};
  for (const [k, v] of Object.entries(style)) {
    if (LAYOUT_KEYS.has(k)) wrapStyle[k] = v;
    else contentStyle[k] = v;
  }
  // Don't override an explicit position: fixed / absolute
  if (!['fixed', 'absolute'].includes(wrapStyle.position) && !style.position) {
    wrapStyle.position = 'relative';
  }

  return (
    <div
      ref={(el) => {
        wrapRef.current = el;
        if (typeof fwdRef === 'function') fwdRef(el);
        else if (fwdRef) fwdRef.current = el;
      }}
      style={wrapStyle}
    >
      {/* Content: clip-path applied here so children are clipped */}
      <div style={{ ...contentStyle, clipPath: shape?.clipPath ?? 'none' }} className={className}>
        {children}
      </div>

      {/* SVG border: sibling to clipped div so it is NOT clipped */}
      {shape && (
        <svg
          aria-hidden="true"
          style={{
            position: 'absolute', left: 0, top: 0,
            width: size.w, height: size.h,
            overflow: 'visible', pointerEvents: 'none',
          }}
          viewBox={`0 0 ${size.w} ${size.h}`}
        >
          <path
            d={shape.svgPath}
            stroke={T.borderAccent}
            strokeWidth="1.5"
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
});

export default RoughBox;
