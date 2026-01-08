const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/', authenticateToken, contentController.createContent);

router.get('/', contentController.getAllContent);

module.exports = router;