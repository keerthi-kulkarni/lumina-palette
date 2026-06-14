function calculateRGBDistance(color1, color2) {
    const [r1, g1, b1] = color1;
    const [r2, g2, b2] = color2;
    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function removeSimilarColors(palette, threshold) {
    const result = [];
    for (const color of palette) {
        let isSimilar = false;
        for (const kept of result) {
            if (calculateRGBDistance(color.rgb, kept.rgb) < threshold) {
                isSimilar = true;
                break;
            }
        }
        if (!isSimilar) {
            result.push(color);
        }
    }
    return result;
}
module.exports = {
  calculateRGBDistance,
  removeSimilarColors,
};
