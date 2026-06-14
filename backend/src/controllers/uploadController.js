const path = require('path');
const fs = require('fs');
const multer = require('multer');

const { extractPalette } = require('../services/imageProcessingService');
const { analyzePalette } = require('../utils/paletteAnalysis');

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

const {
  generateDesignTokens,
} = require('../utils/tokenGenerator');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },

  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);

    cb(null, `${baseName}-${timestamp}${ext}`);
  },
});

const upload = multer({
  storage,

  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }

    cb(null, true);
  },
});

exports.upload = upload.single('image');

exports.uploadImage = async function (req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file uploaded',
      });
    }

    const imagePath = path.join(
      'uploads',
      req.file.filename
    );

    const extractedColors = await extractPalette(req.file.path);

const analyzedPalette =
  analyzePalette(extractedColors);

const tokens =
  generateDesignTokens(
    analyzedPalette
  );

res.json({
  path: imagePath,
  palette: analyzedPalette,
  tokens,
});

  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: error.message,
    });
  }
};  