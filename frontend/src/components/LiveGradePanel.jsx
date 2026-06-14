import { useCallback, useEffect, useRef } from 'react';

const DEFAULT_SETTINGS = {
  hue: 0,
  saturation: 0,
  brightness: 0,
  contrast: 0,
  vibrance: 0,
  temperature: 0,
  sepia: 0,
  opacity: 80,
};

const PRESETS = [
  { label: 'None', settings: { ...DEFAULT_SETTINGS } },
  { label: 'Teal & Orange', settings: { hue: 20, saturation: 22, brightness: 5, contrast: 10, vibrance: 15, temperature: 12, sepia: 0, opacity: 75 } },
  { label: 'Moody', settings: { hue: -3, saturation: -10, brightness: -8, contrast: 18, vibrance: 5, temperature: -8, sepia: 10, opacity: 80 } },
  { label: 'Warm Film', settings: { hue: 5, saturation: 12, brightness: 3, contrast: 8, vibrance: 10, temperature: 25, sepia: 18, opacity: 72 } },
  { label: 'Noir', settings: { hue: 0, saturation: -80, brightness: -5, contrast: 28, vibrance: 0, temperature: -5, sepia: 6, opacity: 85 } },
  { label: 'Pastel', settings: { hue: -6, saturation: -18, brightness: 12, contrast: -8, vibrance: -10, temperature: 5, sepia: 4, opacity: 65 } },
];

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substr(0, 2), 16),
    parseInt(h.substr(2, 2), 16),
    parseInt(h.substr(4, 2), 16),
  ];
}

function applyGrading(ctx, width, height, gradingColors, settings) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Build average grading color from selected palette
  let grR = 128, grG = 128, grB = 128;
  if (gradingColors.length > 0) {
    let rSum = 0, gSum = 0, bSum = 0;
    for (const hex of gradingColors) {
      const [r, g, b] = hexToRgb(hex);
      rSum += r; gSum += g; bSum += b;
    }
    grR = rSum / gradingColors.length;
    grG = gSum / gradingColors.length;
    grB = bSum / gradingColors.length;
  }

  const { hue, saturation, brightness, contrast, vibrance, temperature, sepia, opacity } = settings;
  const opacityFactor = opacity / 100;

  // Precompute LUTs for performance
  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  const brightnessDelta = brightness * 2.55;
  const satFactor = 1 + saturation / 100;
  const vibFactor = vibrance / 100;
  const tempShift = temperature * 1.8;
  const sepiaPct = sepia / 100;
  const hueRad = (hue * Math.PI) / 180;
  const cosH = Math.cos(hueRad);
  const sinH = Math.sin(hueRad);

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // --- Brightness ---
    r += brightnessDelta;
    g += brightnessDelta;
    b += brightnessDelta;

    // --- Contrast ---
    r = contrastFactor * (r - 128) + 128;
    g = contrastFactor * (g - 128) + 128;
    b = contrastFactor * (b - 128) + 128;

    // --- Saturation ---
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    r = lum + satFactor * (r - lum);
    g = lum + satFactor * (g - lum);
    b = lum + satFactor * (b - lum);

    // --- Vibrance (selective saturation boost for less-saturated pixels) ---
    if (vibFactor !== 0) {
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const sat = maxC - minC;
      const vibBoost = vibFactor * (1 - sat / 255);
      const lv = 0.299 * r + 0.587 * g + 0.114 * b;
      r = lv + (1 + vibBoost) * (r - lv);
      g = lv + (1 + vibBoost) * (g - lv);
      b = lv + (1 + vibBoost) * (b - lv);
    }

    // --- Hue rotate ---
    if (hue !== 0) {
      const rn = r * (cosH + (1 - cosH) / 3 + sinH * Math.sqrt(1 / 3))
        + g * ((1 - cosH) / 3 - sinH * Math.sqrt(1 / 3))
        + b * ((1 - cosH) / 3 + sinH * Math.sqrt(1 / 3));
      const gn = r * ((1 - cosH) / 3 + sinH * Math.sqrt(1 / 3))
        + g * (cosH + (1 - cosH) / 3)
        + b * ((1 - cosH) / 3 - sinH * Math.sqrt(1 / 3));
      const bn = r * ((1 - cosH) / 3 - sinH * Math.sqrt(1 / 3))
        + g * ((1 - cosH) / 3 + sinH * Math.sqrt(1 / 3))
        + b * (cosH + (1 - cosH) / 3);
      r = rn; g = gn; b = bn;
    }

    // --- Temperature ---
    r += tempShift;
    b -= tempShift;

    // --- Sepia ---
    if (sepiaPct > 0) {
      const sr = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
      const sg = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
      const sb = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
      r = r + sepiaPct * (sr - r);
      g = g + sepiaPct * (sg - g);
      b = b + sepiaPct * (sb - b);
    }

    // --- Palette color grade overlay ---
    if (gradingColors.length > 0) {
      r = r + opacityFactor * (r * (grR / 128 - 1));
      g = g + opacityFactor * (g * (grG / 128 - 1));
      b = b + opacityFactor * (b * (grB / 128 - 1));
    }

    data[i] = Math.max(0, Math.min(255, Math.round(r)));
    data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
    data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
  }

  ctx.putImageData(imageData, 0, 0);
}

function LiveGradePanel({ imageUrl, gradingColors, settings, onSettingsChange }) {
  const originalCanvasRef = useRef(null);
  const gradedCanvasRef = useRef(null);
  const imgRef = useRef(null);

  // Draw original once image loads
  const drawOriginal = useCallback(() => {
    const img = imgRef.current;
    const canvas = originalCanvasRef.current;
    if (!img || !canvas) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
  }, []);

  // Apply grade and draw graded canvas
  const drawGraded = useCallback(() => {
    const img = imgRef.current;
    const gradedCanvas = gradedCanvasRef.current;
    const originalCanvas = originalCanvasRef.current;
    if (!img || !gradedCanvas || !originalCanvas || !originalCanvas.width) return;

    const w = originalCanvas.width;
    const h = originalCanvas.height;
    gradedCanvas.width = w;
    gradedCanvas.height = h;

    const ctx = gradedCanvas.getContext('2d');
    ctx.drawImage(originalCanvas, 0, 0);
    applyGrading(ctx, w, h, gradingColors, settings);
  }, [gradingColors, settings]);

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      drawOriginal();
      drawGraded();
    };
    img.src = imageUrl;
  }, [imageUrl, drawOriginal, drawGraded]);

  // Re-grade whenever colors or settings change (image already loaded)
  useEffect(() => {
    if (imgRef.current && originalCanvasRef.current?.width) {
      drawGraded();
    }
  }, [drawGraded]);

  function handleSlider(key, value) {
    onSettingsChange({ ...settings, [key]: Number(value) });
  }

  function handleDownload() {
    const canvas = gradedCanvasRef.current;
    if (!canvas || !canvas.width) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'graded-image.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  if (!imageUrl) return null;

  const sliders = [
    { key: 'hue', label: 'Hue', min: -180, max: 180 },
    { key: 'saturation', label: 'Saturation', min: -100, max: 100 },
    { key: 'brightness', label: 'Brightness', min: -100, max: 100 },
    { key: 'contrast', label: 'Contrast', min: -100, max: 100 },
    { key: 'vibrance', label: 'Vibrance', min: -100, max: 100 },
    { key: 'temperature', label: 'Temperature', min: -100, max: 100 },
    { key: 'sepia', label: 'Sepia', min: 0, max: 100 },
    { key: 'opacity', label: 'Grade Strength', min: 0, max: 100 },
  ];

  return (
    <section className="live-grade-panel">
      <div className="panel-title-row">
        <div>
          <span className="panel-eyebrow">Live Preview</span>
          <h3>Original vs Graded</h3>
        </div>
        <button className="download-grade-btn" type="button" onClick={handleDownload}>
          ↓ Download Graded
        </button>
      </div>

      {/* Preview canvases */}
      <div className="grade-preview-grid">
        <div className="grade-preview-card">
          <span className="grade-preview-label">Original</span>
          <div className="grade-canvas-frame">
            <canvas ref={originalCanvasRef} className="grade-canvas" />
          </div>
        </div>
        <div className="grade-preview-card grade-preview-card--graded">
          <span className="grade-preview-label">Live Grade</span>
          <div className="grade-canvas-frame">
            <canvas ref={gradedCanvasRef} className="grade-canvas" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grade-controls">
        {/* Sliders */}
        <div className="grade-sliders">
          {sliders.map(({ key, label, min, max }) => (
            <div key={key} className="grade-slider-row">
              <label className="grade-slider-label">
                <span>{label}</span>
                <span className="grade-slider-value">
                  {settings[key] > 0 ? `+${settings[key]}` : settings[key]}
                </span>
              </label>
              <input
                type="range"
                min={min}
                max={max}
                value={settings[key]}
                onChange={(e) => handleSlider(key, e.target.value)}
                className="grade-slider"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LiveGradePanel;
export { DEFAULT_SETTINGS, PRESETS };