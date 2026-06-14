function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l < 0.5 ? delta / (max + min) : delta / (2 - max - min);

    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / delta + 2) * 60;
        break;
      case b:
        h = ((r - g) / delta + 4) * 60;
        break;
    }
  }

  return { h, s, l };
}

function getBaseHueName(hue) {
  if (hue >= 345 || hue < 15) return 'Red';
  if (hue < 45) return 'Orange';
  if (hue < 70) return 'Yellow';
  if (hue < 90) return 'Lime';
  if (hue < 150) return 'Green';
  if (hue < 180) return 'Teal';
  if (hue < 210) return 'Cyan';
  if (hue < 240) return 'Blue';
  if (hue < 270) return 'Indigo';
  if (hue < 300) return 'Violet';
  return 'Magenta';
}

function getColorName(r, g, b) {
  const red = clamp(Math.round(r), 0, 255);
  const green = clamp(Math.round(g), 0, 255);
  const blue = clamp(Math.round(b), 0, 255);

  const { h, s, l } = rgbToHsl(red, green, blue);

  if (s < 0.15) {
    if (l <= 0.15) return 'Dark Gray';
    if (l <= 0.35) return 'Soft Gray';
    if (l >= 0.85) return 'Pale Gray';
    return 'Gray';
  }

  let modifier = '';
  if (l >= 0.75) {
    modifier = 'Pale';
  } else if (l <= 0.25) {
    modifier = 'Deep';
  } else if (s >= 0.75 && l >= 0.35) {
    modifier = 'Bright';
  } else if (s <= 0.4) {
    modifier = 'Soft';
  }

  const baseName = getBaseHueName(h);
  return modifier ? `${modifier} ${baseName}` : baseName;
}

module.exports = getColorName;
