const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

// Public Routes (Anyone can access)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected Routes (Must have token)
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;