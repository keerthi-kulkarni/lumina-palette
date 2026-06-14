const express = require('express');
const router = express.Router();

const {
  upload,
  uploadImage,
} = require('../controllers/uploadController');

router.post('/', upload, uploadImage);

module.exports = router;