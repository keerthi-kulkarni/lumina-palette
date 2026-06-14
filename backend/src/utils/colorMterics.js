const clamp = (value, min = 0, max = 255) => Math.max(min, Math.min(max, value));

const parseColor = (color) => {
  if (!color) {
    throw new Error('Color is required');
  }

  if (typeof color === 'string') {
    const normalized = color.trim().replace(/^#/, '');

    if (/^[0-9A-Fa-f]{3}$/.test(normalized)) {
      const [r, g, b] = normalized.split('');
      return {
        r: parseInt(r + r, 16),
        g: parseInt(g + g, 16),
        b: parseInt(b + b, 16),
      };
    }

    if (/^[0-9A-Fa-f]{6}$/.test(normalized)) {
      return {
        r: parseInt(normalized.slice(0, 2), 16),
        g: parseInt(normalized.slice(2, 4), 16),
        b: parseInt(normalized.slice(4, 6), 16),
      };
    }

    throw new Error('Invalid color string. Use #RRGGBB, RRGGBB or #RGB.');
  }

  if (Array.isArray(color) && color.length >= 3) {
    return {
      r: clamp(Number(color[0]) || 0),
      g: clamp(Number(color[1]) || 0),
      b: clamp(Number(color[2]) || 0),
    };
  }

  if (typeof color === 'object') {
    return {
      r: clamp(Number(color.r) || 0),
      g: clamp(Number(color.g) || 0),
      b: clamp(Number(color.b) || 0),
    };
  }

  throw new Error('Unsupported color format.');
};

const calculateBrightness = (color) => {
  const { r, g, b } = parseColor(color);
  return (r * 299 + g * 587 + b * 114) / 1000;
};

const getLinearChannel = (value) => {
  const normalized = value / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
};

const calculateLuminance = (color) => {
  const { r, g, b } = parseColor(color);
  const linearR = getLinearChannel(r);
  const linearG = getLinearChannel(g);
  const linearB = getLinearChannel(b);

  return 0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB;
};

const calculateSaturation = (color) => {
  const { r, g, b } = parseColor(color);
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);

  if (max === min) {
    return 0;
  }

  return (max - min) / (1 - Math.abs(max + min - 1));
};

const getColorTemperature = (color) => {
  const { r, g, b } = parseColor(color);
  const linearR = getLinearChannel(r);
  const linearG = getLinearChannel(g);
  const linearB = getLinearChannel(b);

  const x = linearR * 0.4124 + linearG * 0.3576 + linearB * 0.1805;
  const y = linearR * 0.2126 + linearG * 0.7152 + linearB * 0.0722;
  const z = linearR * 0.0193 + linearG * 0.1192 + linearB * 0.9505;
  const sum = x + y + z;

  if (sum === 0) {
    return 0;
  }

  const chromaticityX = x / sum;
  const chromaticityY = y / sum;
  const n = (chromaticityX - 0.3320) / (0.1858 - chromaticityY);
  const temperature = 449 * Math.pow(n, 3) + 3525 * Math.pow(n, 2) + 6823.3 * n + 5520.33;

  return Math.max(1000, Math.min(40000, temperature));
};

module.exports = {
  calculateBrightness,
  calculateLuminance,
  calculateSaturation,
  getColorTemperature,
};
