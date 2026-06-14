import { useMemo, useRef, useState } from 'react';
import {
  hexToHsl,
  hslToHex,
  hslToRgb,
  formatHsl,
  formatRgb,
} from '../utils/colorHelpers';

function ColorWheel({ palette, onCopy }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const wheelRef = useRef(null);

  const nodes = useMemo(() => {
    if (!palette || palette.length === 0) return [];
    const maxRadius = 136;

    return palette.map((color, index) => {
      const [h, s, l] = Array.isArray(color.hsl)
        ? color.hsl
        : hexToHsl(color.hex || '#000000');
      const theta = (h % 360) * (Math.PI / 180);
      const radius = Math.max(22, Math.min(maxRadius, (s / 100) * maxRadius));
      const x = Math.cos(theta) * radius;
      const y = Math.sin(theta) * radius;
      const size = index === 0 ? 62 : 48;

      return {
        id: `node-${index}`,
        color,
        x,
        y,
        size,
        h,
        s,
        l,
      };
    });
  }, [palette]);

  const computeCursor = (event) => {
    const rect = wheelRef.current?.getBoundingClientRect();
    if (!rect) return null;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = event.clientX - rect.left - centerX;
    const y = event.clientY - rect.top - centerY;

    const radius = Math.hypot(x, y);
    const maxRadius = Math.min(centerX, centerY) - 18;
    const limitedRadius = Math.min(radius, maxRadius);
    const angle = Math.atan2(y, x);
    const hue = (angle * (180 / Math.PI) + 360) % 360;
    const saturation = Math.round((limitedRadius / maxRadius) * 100);
    const lightness = 52;
    const hex = hslToHex(hue, saturation, lightness);
    const rgb = hslToRgb(hue, saturation, lightness);

    const nearest = palette
      .map((color) => {
        const [h] = Array.isArray(color.hsl)
          ? color.hsl
          : hexToHsl(color.hex || '#000000');
        const diff = Math.min(Math.abs(h - hue), 360 - Math.abs(h - hue));
        return { color, diff };
      })
      .sort((a, b) => a.diff - b.diff)[0];

    return {
      hex,
      rgb,
      hsl: [hue, saturation, lightness],
      x,
      y,
      nearestShade: nearest?.color?.name || nearest?.color?.hex || 'Spectrum',
    };
  };

  const handlePointerMove = (event) => {
    const current = computeCursor(event);
    setCursor(current);

    if (current) {
      setTooltip({
        hex: current.hex,
        name: current.nearestShade,
        hsl: current.hsl,
        x: current.x,
        y: current.y,
      });
    }
  };

  const clearHover = () => {
    setHoveredId(null);
    setCursor(null);
    setTooltip(null);
  };

  const handleClick = () => {
    if (cursor?.hex) {
      onCopy(cursor.hex);
    }
  };

  if (!nodes.length) return null;

  return (
    <div className="color-wheel-container">
      <div className="color-wheel-header">
        <div>
          <h4>Color Wheel Lab</h4>
          <p className="muted small">Track hue, saturation, and live color values.</p>
        </div>
        {cursor && (
          <div className="wheel-stats">
            <span>{cursor.hex}</span>
            <span>{formatRgb(cursor.rgb)}</span>
            <span>{formatHsl(cursor.hsl)}</span>
          </div>
        )}
      </div>

      <div
        className="color-wheel-frame"
        ref={wheelRef}
        onMouseMove={handlePointerMove}
        onMouseLeave={clearHover}
        onClick={handleClick}
      >
        <div className="wheel-glow" aria-hidden />
        <div className="wheel-background" aria-hidden />
        <div className="wheel-ring" aria-hidden />

        {nodes.map((node) => (
          <button
            type="button"
            key={node.id}
            className={`wheel-node ${hoveredId === node.id ? 'active' : ''}`}
            style={{
              width: node.size,
              height: node.size,
              left: `calc(50% + ${node.x}px)`,
              top: `calc(50% + ${node.y}px)`,
              background: node.color.hex,
              boxShadow: hoveredId === node.id
                ? `0 0 0 10px rgba(255,255,255,0.1), inset 0 0 0 1px rgba(255,255,255,0.22)`
                : `0 0 0 2px rgba(255,255,255,0.1), inset 0 0 0 1px rgba(255,255,255,0.08)`,
            }}
            onClick={(event) => {
              event.stopPropagation();
              setHoveredId(node.id);
              onCopy(node.color.hex);
            }}
            aria-label={`Copy ${node.color.name || node.color.hex}`}
          >
            <span className="wheel-node-ring" />
          </button>
        ))}

        {tooltip && (
          <div
            className="wheel-tooltip"
            style={{
              left: `calc(50% + ${tooltip.x}px + 12px)`,
              top: `calc(50% + ${tooltip.y}px - 12px)`,
            }}
          >
            <div className="tooltip-label">Live Spectrum</div>
            <div className="tooltip-hex">{tooltip.hex}</div>
            <div className="tooltip-name">{tooltip.name}</div>
            <div className="tooltip-subtitle">{formatHsl(tooltip.hsl)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ColorWheel;
