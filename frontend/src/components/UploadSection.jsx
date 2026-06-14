function UploadSection({
  setImage, setPreview, preview, handleUpload,
  isDragging, setIsDragging, palette, onCopyAll, onDownloadTokens,
}) {
  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  return (
    <div className="upload-panel-wrapper">
      {/* 2-Column Layout: LEFT (Dropzone) + RIGHT (Preview) */}
      <div className="upload-panel-inner">
        {/* LEFT: Dropzone */}
        <div
          className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
        >
          <input type="file" accept="image/*" onChange={handleFileChange} className="file-input" />
          <div className="dropzone-content">
            <strong>Drag & drop</strong>
            <span>or click to browse</span>
          </div>
        </div>

        {/* RIGHT: Preview */}
        {preview ? (
          <div className="preview-card">
            <img src={preview} alt="Preview" className="preview-image" />
            <div className="preview-meta">
              {palette.length > 0 && <span className="preview-badge">{palette.length} colors ready</span>}
            </div>
          </div>
        ) : (
          <div className="preview-placeholder">Image preview</div>
        )}
      </div>

      {/* Actions (below both columns) */}
      <div className="upload-actions">
        <button className="btn-primary" type="button" onClick={handleUpload}>
          Extract Palette
        </button>
        {palette.length > 0 && (
          <>
            <button className="btn-ghost" type="button" onClick={onCopyAll}>Copy All</button>
            <button className="btn-ghost" type="button" onClick={onDownloadTokens}>Tokens</button>
          </>
        )}
      </div>
    </div>
  );
}

export default UploadSection;