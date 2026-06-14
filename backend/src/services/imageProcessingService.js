const { Vibrant } = require("node-vibrant/node");

async function extractPalette(imagePath) {
  try {
    const vibrant = new Vibrant(imagePath);

    const palette = await vibrant.getPalette();

    const rgbArrays = [];

    Object.values(palette).forEach((swatch) => {
      if (swatch) {
        rgbArrays.push(swatch.rgb);
      }
    });

    return rgbArrays;

  } catch (error) {
    throw new Error(`Failed to extract palette: ${error.message}`);
  }
}

module.exports = { extractPalette };