const express = require('express');
const router = express.Router();
const { handleChatRequest, handleChatStreamRequest } = require('./chatHandler');

router.post('/', handleChatRequest);
router.post('/stream', handleChatStreamRequest);

module.exports = router;
