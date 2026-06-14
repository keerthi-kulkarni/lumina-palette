const {
  calculateContrastRatio,
  checkWCAGCompliance,
  getBestTextColor,
} = require('./contrastUtils');

function normalizeRgb(color) {
  if (Array.isArray(color)) {
    const [r, g, b] = color;
    return { r: Number(r) || 0, g: Number(g) || 0, b: Number(b) || 0 };
  }

  if (typeof color === 'object' && color !== null) {
    const { r, g, b } = color;
    return { r: Number(r) || 0, g: Number(g) || 0, b: Number(b) || 0 };
  }

  return { r: 0, g: 0, b: 0 };
}

function clamp(value) {
  return Math.max(
    0,
    Math.min(255, Math.round(Number(value) || 0))
  );
}

function calculateBrightnessFromRgb(r, g, b) {
  if (typeof r === 'object' && r !== null) {
    ({ r, g, b } = r);
  }

  const red = Number(r) || 0;
  const green = Number(g) || 0;
  const blue = Number(b) || 0;

  const rr = clamp(red);
  const gg = clamp(green);
  const bb = clamp(blue);

  return Math.sqrt(
    0.299 * rr * rr +
    0.587 * gg * gg +
    0.114 * bb * bb
  );
}

function isDarkColor(r, g, b) {
  return calculateBrightnessFromRgb(r, g, b) < 128;
}

function isLightColor(r, g, b) {
  return calculateBrightnessFromRgb(r, g, b) >= 128;
}

function rgbToHex(color) {
  const { r, g, b } = normalizeRgb(color);

  return (
    '#' +
    [r, g, b]
      .map((value) =>
        clamp(value)
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  );
}

function rgbToHsl(color) {
  const { r, g, b } = normalizeRgb(color);
  const rr = clamp(r) / 255;
  const gg = clamp(g) / 255;
  const bb = clamp(b) / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));

    switch (max) {
      case rr:
        h = ((gg - bb) / delta + (gg < bb ? 6 : 0)) * 60;
        break;
      case gg:
        h = ((bb - rr) / delta + 2) * 60;
        break;
      default:
        h = ((rr - gg) / delta + 4) * 60;
        break;
    }
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function rgbToHsv(color) {
  const { r, g, b } = normalizeRgb(color);
  const rr = clamp(r) / 255;
  const gg = clamp(g) / 255;
  const bb = clamp(b) / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const delta = max - min;
  let h = 0;
  const s = max === 0 ? 0 : delta / max;

  if (delta !== 0) {
    if (max === rr) {
      h = ((gg - bb) / delta + (gg < bb ? 6 : 0)) * 60;
    } else if (max === gg) {
      h = ((bb - rr) / delta + 2) * 60;
    } else {
      h = ((rr - gg) / delta + 4) * 60;
    }
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    v: Math.round(max * 100),
  };
}

function calculateRelativeLuminance(color) {
  const { r, g, b } = normalizeRgb(color);
  const toLinear = (value) => {
    const normalized = clamp(value) / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };

  return Number(
    (
      0.2126 * toLinear(r) +
      0.7152 * toLinear(g) +
      0.0722 * toLinear(b)
    ).toFixed(4)
  );
}

function getTemperatureCategory(color) {
  const { h, s } = rgbToHsl(color);

  if (s < 15) {
    return 'neutral';
  }

  if (h < 50 || h >= 330) {
    return 'warm';
  }

  return 'cool';
}

function getColorName(color) {
  const { h, s, l } = rgbToHsl(color);

  if (s < 10) {
    if (l < 10) {
      return 'Black';
    }
    if (l < 40) {
      return 'Dark Gray';
    }
    if (l < 60) {
      return 'Gray';
    }
    if (l < 90) {
      return 'Light Gray';
    }
    return 'White';
  }

  const prefix = s < 40 ? 'Muted ' : '';

  if (h < 15 || h >= 345) {
    return `${prefix}Red`;
  }
  if (h < 45) {
    return `${prefix}Orange`;
  }
  if (h < 65) {
    return `${prefix}Yellow`;
  }
  if (h < 135) {
    return `${prefix}Green`;
  }
  if (h < 165) {
    return `${prefix}Cyan`;
  }
  if (h < 195) {
    return `${prefix}Teal`;
  }
  if (h < 255) {
    return `${prefix}Blue`;
  }
  if (h < 285) {
    return `${prefix}Purple`;
  }
  if (h < 330) {
    return `${prefix}Magenta`;
  }

  return `${prefix}Red`;
}

function analyzePalette(colors) {
  if (!Array.isArray(colors)) {
    return [];
  }

  return colors.map((color) => {
    const normalized = normalizeRgb(color);
    const rgbValue = {
      r: clamp(normalized.r),
      g: clamp(normalized.g),
      b: clamp(normalized.b),
    };
   const hsl = rgbToHsl(rgbValue);
const hsv = rgbToHsv(rgbValue);
const brightness = calculateBrightnessFromRgb(rgbValue);
const luminance = calculateRelativeLuminance(rgbValue);
const dark = isDarkColor(rgbValue);
const light = isLightColor(rgbValue);

const contrastAgainstWhite =
  calculateContrastRatio(
    rgbToHex(rgbValue),
    '#ffffff'
  );

const contrastAgainstBlack =
  calculateContrastRatio(
    rgbToHex(rgbValue),
    '#000000'
  );

const wcagWhite =
  checkWCAGCompliance(
    contrastAgainstWhite
  );

const wcagBlack =
  checkWCAGCompliance(
    contrastAgainstBlack
  );

const bestTextColor =
  getBestTextColor(
    rgbToHex(rgbValue)
  );

    return {
  hex: rgbToHex(rgbValue),
  rgb: `rgb(${rgbValue.r}, ${rgbValue.g}, ${rgbValue.b})`,
  hsl,
  hsv,
  name: getColorName(rgbValue),
  brightness: Number(brightness.toFixed(2)),
  luminance,
  saturation: hsl.s,
  temperatureCategory: getTemperatureCategory(rgbValue),
  isDark: dark,
  isLight: light,

  contrastAgainstWhite,
  contrastAgainstBlack,
  wcagWhite,
  wcagBlack,
  bestTextColor,

  recommendedTextColor: dark ? '#FFFFFF' : '#000000',
};
  });
}

module.exports = {
  calculateBrightnessFromRgb,
  isDarkColor,
  isLightColor,
  analyzePalette,
  
};
