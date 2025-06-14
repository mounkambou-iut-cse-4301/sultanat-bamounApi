const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');

router.post('/send-news-letter-confirmation', newsletterController.subscribe);
router.get('/subscribers', newsletterController.getAllSubscribers);

module.exports = router;