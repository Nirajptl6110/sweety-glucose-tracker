const express = require('express');
const authenticateToken = require('../middleware/auth.middleware');
const {
  getDailyReport,
  getMonthToDateReport,
  getPreviousMonthReport,
} = require('../controllers/reports.controller');

const router = express.Router();

router.get('/daily', authenticateToken, getDailyReport);
router.get('/month-to-date', authenticateToken, getMonthToDateReport);
router.get('/previous-month', authenticateToken, getPreviousMonthReport);

module.exports = router;
