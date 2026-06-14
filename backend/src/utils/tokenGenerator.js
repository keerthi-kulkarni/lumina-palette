function getLuminance(hex) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function getContrastingText(bgHex) {
  const lum = getLuminance(bgHex);
  return lum > 0.5 ? '#000000' : '#ffffff';
}

function generateDesignTokens(palette) {
  if (palette.length < 5) {
    throw new Error('Palette must have at least 5 colors');
  }

  return {
    primary: palette[0].hex,
    secondary: palette[1].hex,
    accent: palette[2].hex,
    background: palette[3].hex,
    surface: palette[4].hex,

    textPrimary: getContrastingText(
      palette[3].hex
    ),

    textSecondary: getContrastingText(
      palette[4].hex
    ),
  };
}

module.exports = {
  generateDesignTokens,
};