import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api from './services/api';
import UploadSection from './components/UploadSection';
import PaletteGrid from './components/PaletteGrid';
import IntroScreen from './components/IntroScreen';
import ShadeExplorer from './components/ShadeExplorer';
import LiveGradePanel, { DEFAULT_SETTINGS, PRESETS } from './components/LiveGradePanel';
import Toast from './components/Toast';
import EmptyState from './components/EmptyState';
import Footer from './components/Footer';
import './App.css';

function App() {
  // ── Core state ──────────────────────────────────────────────
  const [image,        setImage]       = useState(null);
  const [preview,      setPreview]     = useState(null);
  const [palette,      setPalette]     = useState([]);
  const [loading,      setLoading]     = useState(false);
  const [toast,        setToast]       = useState(null);
  const [isDragging,   setIsDragging]  = useState(false);
  const [copyIndex,    setCopyIndex]   = useState(null);
  const [exportOpen,   setExportOpen]  = useState(false);
  const [showIntro,    setShowIntro]   = useState(true);
  const [selectedShade, setSelectedShade] = useState(null);

  // ── Live Grade state ─────────────────────────────────────────
  const [gradingMode,   setGradingMode]   = useState(false);
  const [gradingColors, setGradingColors] = useState([]);
  const [gradeSettings, setGradeSettings] = useState({ ...DEFAULT_SETTINGS });
  const [activePreset,  setActivePreset]  = useState('None');

  const toastTimer = useRef(null);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // ── Helpers ──────────────────────────────────────────────────
  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }

  function handleCopy(hex) {
    navigator.clipboard.writeText(hex);
    showToast(`Copied ${hex}`);
    setCopyIndex(hex);
    setTimeout(() => setCopyIndex(null), 900);
    setSelectedShade(hex);
  }

  function handleGradeToggle(hex) {
    setGradingColors(prev => {
      if (prev.includes(hex)) { showToast(`Removed ${hex}`); return prev.filter(c => c !== hex); }
      showToast(`Added ${hex} to grade`); return [...prev, hex];
    });
  }

  function toggleGradingMode() {
    setGradingMode(prev => {
      const next = !prev;
      showToast(next ? 'Grade mode on — tap swatches to add' : 'Grade mode off');
      return next;
    });
  }

  function handleCopyAll() {
    if (!palette.length) return;
    navigator.clipboard.writeText(palette.map(c => c.hex).join(', '));
    showToast('Copied all colors');
  }

  function downloadFile(name, content, type = 'text/plain') {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const a = Object.assign(document.createElement('a'), { href: url, download: name });
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    showToast(`Exported ${name}`);
    setExportOpen(false);
  }

  function exportAsJSON()     { downloadFile('palette.json',  JSON.stringify(palette, null, 2), 'application/json'); }
  function exportAsCSSVars()  { downloadFile('palette.css',   `:root {\n${palette.map((c,i) => `  --color-${i+1}: ${c.hex};`).join('\n')}\n}`, 'text/css'); }
  function exportAsTailwind() {
    const colors = palette.map((c,i) => `      'palette-${i+1}': '${c.hex}',`).join('\n');
    downloadFile('tailwind-palette.js', `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${colors}\n      }\n    }\n  }\n}`, 'text/javascript');
  }

  function handleDownloadTokens() {
    if (!palette.length) return;
    const tokens = { primary: palette[0]?.hex, secondary: palette[1]?.hex, accent: palette[2]?.hex, background: palette[3]?.hex, surface: palette[4]?.hex };
    downloadFile('tokens.json', JSON.stringify(tokens, null, 2), 'application/json');
  }

  async function handleUpload() {
    if (!image) { showToast('Select an image first'); return; }
    const fd = new FormData(); fd.append('image', image);
    try {
      setLoading(true);
      const { data } = await api.post('/upload', fd);
      setPalette(data.palette || []);
      setGradingColors([]); setGradeSettings({ ...DEFAULT_SETTINGS }); setGradingMode(false);
      setActivePreset('None');
    } catch { showToast('Upload failed'); }
    finally { setLoading(false); }
  }

  function handlePreset(preset) {
    setActivePreset(preset.label);
    setGradeSettings(preset.settings);
  }

  function handleRemoveGradeColor(hex) {
    setGradingColors(prev => prev.filter(c => c !== hex));
    showToast(`Removed ${hex}`);
  }

  function handleResetSliders() {
    setGradeSettings({ ...DEFAULT_SETTINGS });
    setActivePreset('None');
    showToast('Sliders reset to default');
  }

  function handleClearGradingColors() {
    if (gradingColors.length === 0) {
      showToast('No colors to clear');
      return;
    }
    setGradingColors([]);
    showToast('Selected colors cleared');
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="app">
      <div className="animated-bg" aria-hidden />

      {showIntro && <IntroScreen onFinish={() => setShowIntro(false)} />}

      {!showIntro && (
        <>
          {/* ── Navbar ── */}
          <header className="navbar">
            <div className="nav-brand">Lumina Palette</div>
            <nav className="nav-right">
              {palette.length > 0 && (
                <button
                  type="button"
                  className={`nav-btn-grade ${gradingMode ? 'grade-active' : ''}`}
                  onClick={toggleGradingMode}
                >
                  {gradingMode ? '✦ Grade Mode ON' : 'Build Your Live Grade'}
                </button>
              )}
              <button
                className="nav-btn-export"
                onClick={() => setExportOpen(o => !o)}
                aria-haspopup="menu" aria-expanded={exportOpen}
              >
                Export
              </button>
              {exportOpen && (
                <div className="export-menu" role="menu">
                  <button role="menuitem" onClick={exportAsJSON}>JSON</button>
                  <button role="menuitem" onClick={exportAsCSSVars}>CSS Variables</button>
                  <button role="menuitem" onClick={exportAsTailwind}>Tailwind Config</button>
                </div>
              )}
              <button className="nav-btn-copy-all" onClick={() => palette.length && handleCopyAll()}>
                Copy All
              </button>
            </nav>
          </header>

          {/* ── Main ── */}
          <main className="main-content">

            {/* Row 1: Upload + Extracted Palette (2-column) */}
            <div className="studio-grid">
              {/* LEFT: Upload */}
              <div className="panel-glass">
                <span className="panel-eyebrow">Upload Studio</span>
                <h2 className="panel-title">Drop your image</h2>
                <UploadSection
                  setImage={setImage}
                  setPreview={setPreview}
                  preview={preview}
                  handleUpload={handleUpload}
                  isDragging={isDragging}
                  setIsDragging={setIsDragging}
                  palette={palette}
                  onCopyAll={handleCopyAll}
                  onDownloadTokens={handleDownloadTokens}
                />
              </div>

              {/* RIGHT: Extracted Palette */}
              {palette.length > 0 && (
                <div className="panel-glass">
                  <div className="panel-title-row">
                    <div>
                      <span className="panel-eyebrow">Extracted Palette</span>
                      <h3>Signature colors</h3>
                    </div>
                    <div className="palette-panel-right">
                      {gradingMode && <span className="grade-mode-hint">Click to add/remove</span>}
                      <span className="panel-note">{palette.length} colors</span>
                    </div>
                  </div>
                  <PaletteGrid
                    palette={palette}
                    onCopy={handleCopy}
                    copyIndex={copyIndex}
                    gradingMode={gradingMode}
                    gradingColors={gradingColors}
                    onGradeToggle={handleGradeToggle}
                  />
                </div>
              )}
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div className="loading-area">
                <p className="loading-text">Extracting palette…</p>
                <div className="skeleton-grid">
                  {Array.from({ length: 5 }).map((_, i) => <div className="skeleton-card" key={i} />)}
                </div>
              </div>
            )}

            {/* Row 3: Shade Explorer (context-aware for grading mode) */}
            {palette.length > 0 && (
              <section className="panel-glass">
                <ShadeExplorer
                  palette={palette}
                  onCopy={handleCopy}
                  selectedShade={selectedShade}
                  setSelectedShade={setSelectedShade}
                  gradingMode={gradingMode}
                  gradingColors={gradingColors}
                  onGradeToggle={handleGradeToggle}
                />
              </section>
            )}

            {/* Row 4: Build Your Live Grade (management panel) */}
            {palette.length > 0 && (
              <section className="panel-glass">
                <div className="panel-title-row">
                  <div>
                    <span className="panel-eyebrow">Build Your Live Grade</span>
                    <h3>Selected colors</h3>
                  </div>
                  <span className="panel-note">
                    {gradingMode
                      ? `${gradingColors.length} color${gradingColors.length !== 1 ? 's' : ''} selected`
                      : 'Enable grade mode above to select'}
                  </span>
                </div>
                
                <div className="grade-palette-row">
                  <div className="grade-swatches">
                    {gradingColors.length === 0 ? (
                      <span className="grade-palette-empty">
                        {gradingMode
                          ? 'Click colors above to start building your grade'
                          : 'Enable grade mode in navbar to select colors'}
                      </span>
                    ) : (
                      gradingColors.map((hex) => (
                        <div key={hex} className="grade-swatch-chip">
                          <span className="grade-swatch-dot" style={{ background: hex }} />
                          <span className="grade-swatch-hex">{hex}</span>
                          <button
                            type="button"
                            className="grade-swatch-remove"
                            onClick={() => handleRemoveGradeColor(hex)}
                            aria-label={`Remove ${hex}`}
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  {gradingColors.length > 0 && (
                    <button
                      type="button"
                      className="btn-clear-colors"
                      onClick={handleClearGradingColors}
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* Row 5: Single Live Preview (Original vs Graded) — MOVED BEFORE PRESETS */}
            {preview && palette.length > 0 && (
              <>
                <LiveGradePanel
                  imageUrl={preview}
                  gradingColors={gradingColors}
                  settings={gradeSettings}
                  onSettingsChange={(settings) => {
                    setGradeSettings(settings);
                    setActivePreset('None');
                  }}
                />
                {/* Reset Sliders Button */}
                <section className="panel-glass" style={{ padding: '14px 20px' }}>
                  <button
                    type="button"
                    className="btn-reset-sliders"
                    onClick={handleResetSliders}
                  >
                    ↻ Reset Sliders
                  </button>
                </section>
              </>
            )}

            {/* Row 6: Cinematic Presets — MOVED AFTER PREVIEW */}
            {palette.length > 0 && (
              <section className="panel-glass">
                <div className="panel-title-row">
                  <div>
                    <span className="panel-eyebrow">Cinematic Presets</span>
                    <h3>Quick grades</h3>
                  </div>
                  <span className="panel-note">Click to apply a preset</span>
                </div>
                <div className="grade-presets">
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      className={`grade-preset-btn ${activePreset === p.label ? 'active' : ''}`}
                      onClick={() => handlePreset(p)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Empty states */}
            {!loading && !preview && (
              <EmptyState onActionText="Drop an image above to begin" />
            )}
            {!loading && preview && palette.length === 0 && (
              <EmptyState onActionText="Click Extract Palette to generate colors" />
            )}
          </main>

          <Toast message={toast} />
          <Footer />
        </>
      )}
    </div>
  );
}

export default App;