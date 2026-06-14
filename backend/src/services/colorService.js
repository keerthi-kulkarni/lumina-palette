const { removeSimilarColors } = require('../utils/colorUtils');

const {
  calculateBrightnessFromRgb,
  isDarkColor,
  isLightColor,
} = require('../utils/paletteAnalysis');

const extractPalette = async (imagePath) => {
  const { Vibrant } = await import('node-vibrant/node');

  const namerModule = await import('color-namer');
  const namer = namerModule.default;

  const palette = await Vibrant.from(imagePath).getPalette();

  const swatches = [
    'Vibrant',
    'DarkVibrant',
    'LightVibrant',
    'Muted',
    'DarkMuted',
    'LightMuted',
  ];

  const result = [];

  for (const swatchName of swatches) {
    const swatch = palette[swatchName];

    if (swatch) {
      const hex = swatch.hex;
      const rgb = swatch.rgb;

      const names = namer(hex);

      const name =
        names?.basic?.[0]?.name ||
        names?.ntc?.[0]?.name ||
        'unknown';

      const brightness = calculateBrightnessFromRgb(
        rgb[0],
        rgb[1],
        rgb[2]
      );

      const isDark = isDarkColor(
        rgb[0],
        rgb[1],
        rgb[2]
      );

      const isLight = isLightColor(
        rgb[0],
        rgb[1],
        rgb[2]
      );

      result.push({
        hex,
        rgb,
        name,
        brightness,
        isDark,
        isLight,
      });
    }
  }

  return removeSimilarColors(result, 80);
};

module.exports = { extractPalette };