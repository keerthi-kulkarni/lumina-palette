function parseHexColor(color) {
  const normalized = String(color).trim().toLowerCase();
  const hex = normalized.startsWith('#') ? normalized.slice(1) : normalized;
  if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$/.test(hex)) {
    throw new Error(`Invalid hex color: ${color}`);
  }
  const fullHex = hex.length === 3
    ? hex.split('').map((digit) => digit + digit).join('')
    : hex;
  return [
    parseInt(fullHex.slice(0, 2), 16),
    parseInt(fullHex.slice(2, 4), 16),
    parseInt(fullHex.slice(4, 6), 16),
  ];
}

function linearizeChannel(channel) {
  const value = channel / 255;
  return value <= 0.03928
    ? value / 12.92
    : Math.pow((value + 0.055) / 1.055, 2.4);
}

function getRelativeLuminance(color) {
  const [r, g, b] = parseHexColor(color);
  const R = linearizeChannel(r);
  const G = linearizeChannel(g);
  const B = linearizeChannel(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function calculateContrastRatio(color1, color2) {
  const luminance1 = getRelativeLuminance(color1);
  const luminance2 = getRelativeLuminance(color2);
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

function checkWCAGCompliance(ratio) {
  const value = Number(ratio);
  if (Number.isNaN(value)) {
    throw new Error('Contrast ratio must be a number');
  }
  return {
    aa: value >= 4.5,
    aaLarge: value >= 3,
    aaa: value >= 7,
    aaaLarge: value >= 4.5,
  };
}

function getBestTextColor(backgroundColor) {
  const whiteContrast = calculateContrastRatio(backgroundColor, '#ffffff');
  const blackContrast = calculateContrastRatio(backgroundColor, '#000000');
  return whiteContrast >= blackContrast ? '#ffffff' : '#000000';
}

module.exports = {
  calculateContrastRatio,
  checkWCAGCompliance,
  getBestTextColor,
};
