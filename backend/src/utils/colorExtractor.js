const sharp = require('sharp');

async function extractImageData(imagePath) {
  const image = sharp(imagePath);

  const resized = await image
    .resize(150, 150, {
      fit: 'fill',
      withoutEnlargement: false,
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  return {
    data: resized.data,
    width: 150,
    height: 150,
    channels: resized.info.channels,
  };
}

module.exports = { extractImageData };