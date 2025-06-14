const express = require('express');
const router = express.Router();
const bookDownloadController = require('../controllers/bookDownloadController');

router.post('/books/request-download', bookDownloadController.requestDownload);
router.get('/books/download-request', bookDownloadController.getAllDownloadRequests);

module.exports = router;