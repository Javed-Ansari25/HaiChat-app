const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { uploadMessage } = require('../config/cloudinary');

const router = express.Router();
router.use(protect);

// Generic file upload endpoint
router.post('/media', uploadMessage.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({
    success: true,
    url: req.file.path,
    publicId: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    resourceType: req.file.resource_type,
  });
});

module.exports = router;
