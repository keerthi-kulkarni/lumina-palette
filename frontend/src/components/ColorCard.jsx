function ColorCard({ color, onCopy, isCopied, gradingMode, isInGrade, onGradeToggle }) {
  function handleSwatchClick() {
    if (gradingMode) {
      onGradeToggle(color.hex);
    } else {
      onCopy(color.hex);
    }
  }

  return (
    <article className={`palette-chip ${isInGrade ? 'in-grade' : ''}`} tabIndex={0}>
      <button
        type="button"
        className={`palette-swatch ${isInGrade ? 'grade-selected' : ''}`}
        aria-label={gradingMode ? `${isInGrade ? 'Remove from' : 'Add to'} grade ${color.hex}` : `Copy ${color.hex}`}
        style={{ background: color.hex }}
        onClick={handleSwatchClick}
      >
        {isInGrade && <span className="grade-check">✓</span>}
      </button>

      <div className="palette-chip-meta">
        <p className="chip-name">{color.name || color.hex}</p>
        <p className="chip-hex">{color.hex}</p>
      </div>

      <button
        type="button"
        className={`chip-copy ${isCopied ? 'copied' : ''}`}
        onClick={() => onCopy(color.hex)}
      >
        {isCopied ? 'Copied' : 'Copy'}
      </button>
    </article>
  );
}

export default ColorCard;