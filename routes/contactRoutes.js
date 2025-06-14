const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

router.post('/send-contact-message', contactController.sendMessage);
router.get('/contact-messages', contactController.getAllMessages);

module.exports = router;