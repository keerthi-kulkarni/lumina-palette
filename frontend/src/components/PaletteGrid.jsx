import ColorCard from './ColorCard';

function PaletteGrid({ palette, onCopy, copyIndex, gradingMode, gradingColors, onGradeToggle }) {
  return (
    <div className="palette-grid">
      {palette.map((color, index) => (
        <ColorCard
          key={index}
          color={color}
          onCopy={onCopy}
          isCopied={copyIndex === color.hex}
          gradingMode={gradingMode}
          isInGrade={gradingColors?.includes(color.hex)}
          onGradeToggle={onGradeToggle}
        />
      ))}
    </div>
  );
}

export default PaletteGrid;