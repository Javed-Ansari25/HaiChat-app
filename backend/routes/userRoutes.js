const express = require('express');
const { searchUsers, getUserById, updateProfile, updateAvatar } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../config/cloudinary');

const router = express.Router();

router.use(protect);

router.get('/search', searchUsers);
router.get('/:id', getUserById);
router.put('/profile', updateProfile);
router.put('/avatar', uploadAvatar.single('avatar'), updateAvatar);

module.exports = router;
