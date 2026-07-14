const express = require('express');
const multer = require('multer');
const { uploadMedia, deleteMedia } = require('../controllers/mediaController');

const router = express.Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.post('/upload', upload.single('file'), uploadMedia);
router.delete('/:id', deleteMedia);

module.exports = router;
