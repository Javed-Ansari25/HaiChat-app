const express = require('express');
const {
  accessChat, getMyChats, createGroupChat, updateGroupChat, leaveGroupChat, getChatById
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../config/cloudinary');

const router = express.Router();
router.use(protect);

router.post('/access', accessChat);
router.get('/', getMyChats);
router.get('/:chatId', getChatById);
router.post('/group', createGroupChat);
router.put('/group/:chatId', uploadAvatar.single('groupAvatar'), updateGroupChat);
router.delete('/group/:chatId/leave', leaveGroupChat);

module.exports = router;
