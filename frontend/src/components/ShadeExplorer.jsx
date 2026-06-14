import { buildShadeVariants, formatHsl } from '../utils/colorHelpers';

function ShadeExplorer({
  palette,
  onCopy,
  selectedShade,
  setSelectedShade,
  gradingMode = false,
  gradingColors = [],
  onGradeToggle = null,
}) {
  if (!Array.isArray(palette) || palette.length === 0) return null;

  function handleShadeClick(hex) {
    if (gradingMode && onGradeToggle) {
      onGradeToggle(hex);
      setSelectedShade(hex);
    } else {
      onCopy(hex);
      setSelectedShade(hex);
    }
  }

  const isInGrade = (hex) => gradingColors?.includes(hex);

  return (
    <div className="shade-explorer">
      <div className="shade-header">
        <div>
          <h4>Shade Explorer</h4>
          <p className="muted small">
            {gradingMode
              ? 'Click any swatch to add/remove from your grade'
              : 'Click any swatch to copy its hex value'}
          </p>
        </div>
      </div>

      <div className="shade-matrix">
        {palette.map((color, index) => {
          const shades = buildShadeVariants(color);
          return (
            <div className="shade-row" key={color.hex || index}>
              <div className="shade-row-meta">
                <span className="shade-keyline" style={{ background: color.hex }} />
                <div>
                  <p className="shade-base-name">{color.name || `Color ${index + 1}`}</p>
                  <span className="shade-base-hex">{color.hex}</span>
                  <span className="shade-base-hsl">{formatHsl(color.hsl || [0, 0, 0])}</span>
                </div>
              </div>

              <div className="shade-row-swatches">
                {shades.map((shade) => (
                  <button
                    key={shade.hex}
                    type="button"
                    className={`shade-pill ${selectedShade === shade.hex ? 'selected' : ''} ${gradingMode && isInGrade(shade.hex) ? 'in-grade' : ''}`}
                    style={{ background: shade.hex }}
                    onClick={() => handleShadeClick(shade.hex)}
                    aria-label={
                      gradingMode
                        ? `${isInGrade(shade.hex) ? 'Remove from' : 'Add to'} grade ${shade.hex}`
                        : `Copy ${shade.label} ${shade.hex}`
                    }
                  >
                    {gradingMode && isInGrade(shade.hex) && <span className="grade-check-small">✓</span>}
                    <span className="shade-title">{shade.label}</span>
                    <span className="shade-hex">{shade.hex}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ShadeExplorer;
