const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticateToken = require('../middleware/authMiddleware');

// Get Dashboard Data
router.get('/', authenticateToken, dashboardController.getDashboardData);

// Get All Users (Leader + Members only, no team data)
router.get('/users', authenticateToken, dashboardController.getAllUsers);

// Get Leader Only
router.get('/leader', authenticateToken, dashboardController.getLeader);

// Get Members Only
router.get('/members', authenticateToken, dashboardController.getMembers);

// Member Routes
router.post('/member', authenticateToken, dashboardController.submitMember);
router.put('/member/:id', authenticateToken, dashboardController.updateMember);
router.delete('/member/:id', authenticateToken, dashboardController.deleteMember);

module.exports = router;