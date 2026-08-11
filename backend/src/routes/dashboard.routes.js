const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/summary', dashboardController.summary);
router.get('/by-category', dashboardController.byCategory);
router.get('/by-budget', dashboardController.byBudget);
router.get('/compare', dashboardController.compare);

module.exports = router;
