const express = require('express');
const { sendMessage, getMessages, deleteMessage, markAsSeen } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const { uploadMessage } = require('../config/cloudinary');

const router = express.Router();
router.use(protect);

router.post('/', uploadMessage.single('media'), sendMessage);
router.get('/:chatId', getMessages);
router.delete('/:messageId', deleteMessage);
router.put('/:chatId/seen', markAsSeen);

module.exports = router;
