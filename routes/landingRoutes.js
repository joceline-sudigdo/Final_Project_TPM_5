const express = require('express');
const router = express.Router();
const landingController = require('../controllers/landingController');

router.get('/', landingController.getLandingData);

router.get('/content/:type', landingController.getContentByType);

router.get('/statistics', landingController.getStatistics);

module.exports = router;