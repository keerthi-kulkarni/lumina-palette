function FilterPreview({ imageUrl, variant, onReset }) {
  if (!imageUrl || !variant) return null;

  const filterStyle = `hue-rotate(${variant.filter.hueRotate}deg) saturate(${variant.filter.saturation}%) contrast(${variant.filter.contrast}%) brightness(${variant.filter.brightness}%)`;

  return (
    <section className="panel-glass filter-preview-panel">
      <div className="panel-title-row">
        <div>
          <span className="panel-eyebrow">Grading Preview</span>
          <h3>{variant.label}</h3>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginTop:2 }}>{variant.description}</p>
        </div>
        <button className="filter-reset" type="button" onClick={onReset}>Reset Grade</button>
      </div>

      <div className="filter-preview-grid">
        <div className="filter-card">
          <span className="filter-state">Original</span>
          <div className="filter-image-frame">
            <img src={imageUrl} alt="Original" />
          </div>
        </div>
        <div className="filter-card filter-card--graded">
          <span className="filter-state">Cinematic Grade</span>
          <div className="filter-image-frame">
            <img src={imageUrl} alt="Graded" style={{ filter: filterStyle }} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default FilterPreview;