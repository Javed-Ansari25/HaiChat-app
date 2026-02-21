const express = require('express');
const { getSmartReplies, aiChatAssistant, summarizeChat, analyzeSentiment,  testAI } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);

router.post('/smart-replies', getSmartReplies);
router.post('/chat', aiChatAssistant);
router.post('/summarize/:chatId', summarizeChat);
router.post('/sentiment', analyzeSentiment);
router.get('/test', testAI);

module.exports = router;
