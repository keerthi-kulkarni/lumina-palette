export function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

export function hexToHsl(hex) {
  const parsed = hex.replace('#', '');
  const r = parseInt(parsed.substr(0, 2), 16) / 255;
  const g = parseInt(parsed.substr(2, 2), 16) / 255;
  const b = parseInt(parsed.substr(4, 2), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const delta = max - min;
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
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
      default:
        h = 0;
    }
  }

  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

export function hslToHex(h, s, l) {
  s = s / 100;
  l = l / 100;
  const a = s * Math.min(l, 1 - l);

  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };

  return `#${f(0)}${f(8)}${f(4)}`;
}

export function formatHsl(value) {
  if (!Array.isArray(value) || value.length < 3) return '';
  const [h, s, l] = value;
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

export function buildShadeVariants(color) {
  const [h, s, l] = Array.isArray(color.hsl)
    ? color.hsl
    : hexToHsl(color.hex || '#000000');

  const variations = [
    { label: 'Deep Shadow', sat: s, light: clamp(l - 28, 0, 100) },
    { label: 'Dark Mood', sat: s, light: clamp(l - 16, 0, 100) },
    { label: 'Base', sat: s, light: clamp(l, 0, 100) },
    { label: 'Soft Light', sat: clamp(s - 8, 0, 100), light: clamp(l + 12, 0, 100) },
    { label: 'Glow', sat: s, light: clamp(l + 28, 0, 100) },
    { label: 'Muted', sat: clamp(s - 30, 0, 100), light: clamp(l + 6, 0, 100) },
    { label: 'Vivid', sat: clamp(s + 28, 0, 100), light: clamp(l - 6, 0, 100) },
  ];

  return variations.map((variant) => ({
    ...variant,
    hex: hslToHex(h, variant.sat, variant.light),
  }));
}

export function shiftHue(hue, amount) {
  return ((hue + amount) % 360 + 360) % 360;
}

export function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;

  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const color = l - a * Math.max(-1, Math.min(Math.min(k(n) - 3, 9 - k(n)), 1));
    return Math.round(255 * color);
  };

  return [f(0), f(8), f(4)];
}

export function rgbToHex(r, g, b) {
  const format = (value) => value.toString(16).padStart(2, '0');
  return `#${format(r)}${format(g)}${format(b)}`;
}

export function formatRgb(value) {
  if (!Array.isArray(value) || value.length < 3) return '';
  const [r, g, b] = value;
  return `rgb(${r}, ${g}, ${b})`;
}

export function derivePaletteVariants(palette) {
  if (!Array.isArray(palette) || palette.length === 0) return [];

  const primary = palette[0];
  const [baseHue, baseSat, baseLight] = Array.isArray(primary.hsl)
    ? primary.hsl
    : hexToHsl(primary.hex || '#2a2a2a');

  const build = (offsets, satFactor, lightShift) =>
    offsets.map((offset, index) => {
      const hue = shiftHue(baseHue, offset);
      const sat = clamp(Math.round(baseSat * satFactor), 12, 100);
      const light = clamp(baseLight + (Array.isArray(lightShift) ? lightShift[index] : lightShift), 0, 100);
      return hslToHex(hue, sat, light);
    });

  return [
    {
      id: 'analogous',
      label: 'Analogous Flow',
      description: 'Soft sibling tones with cinematic harmony.',
      colors: build([-36, -18, 0, 18, 36], 1.05, [48, 52, 56, 52, 48]),
      filter: { hueRotate: -4, saturation: 112, contrast: 106, brightness: 103 },
    },
    {
      id: 'complementary',
      label: 'Bold Complement',
      description: 'Contrast-rich opposing tones for dramatic staging.',
      colors: build([0, 180, 160, 200, 180], 1.05, [52, 48, 56, 48, 52]),
      filter: { hueRotate: 12, saturation: 118, contrast: 112, brightness: 100 },
    },
    {
      id: 'triadic',
      label: 'Triadic Motion',
      description: 'Balanced three-point color grading for cinematic depth.',
      colors: build([0, 120, 240, 135, 255], 1.03, [48, 52, 56, 50, 54]),
      filter: { hueRotate: -8, saturation: 116, contrast: 110, brightness: 102 },
    },
    {
      id: 'teal-orange',
      label: 'Teal & Orange',
      description: 'Classic cinematic warmth with cool contrast.',
      colors: build([180, 20, 15, 195, 35], 0.95, [52, 60, 46, 50, 58]),
      filter: { hueRotate: 20, saturation: 122, contrast: 114, brightness: 105 },
    },
    {
      id: 'pastel',
      label: 'Pastel Wash',
      description: 'Soft, luminous palettes with subtle diffusion.',
      colors: build([-18, 0, 22, 40, 58], 0.55, [78, 82, 86, 80, 84]),
      filter: { hueRotate: -6, saturation: 102, contrast: 96, brightness: 112 },
    },
    {
      id: 'moody',
      label: 'Moody Grade',
      description: 'Rich low-light tones with elegant cinematic weight.',
      colors: build([0, 10, -10, 24, -24], 1.18, [28, 34, 36, 30, 32]),
      filter: { hueRotate: -2, saturation: 98, contrast: 120, brightness: 92 },
    },
    {
      id: 'noir',
      label: 'Noir Shift',
      description: 'Desaturated drama for high-contrast storytelling.',
      colors: build([0, 12, -12, 24, -24], 0.18, [22, 28, 34, 26, 30]),
      filter: { hueRotate: 0, saturation: 64, contrast: 132, brightness: 88 },
    },
  ];
}
