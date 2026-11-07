const express = require('express');
const {
  createReading,
  getReadings,
  getReadingById,
  updateReading,
  deleteReading,
} = require('../controllers/readings.controller');
const authenticateToken = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authenticateToken, getReadings);
router.get('/:id', authenticateToken, getReadingById);
router.post('/', authenticateToken, createReading);
router.put('/:id', authenticateToken, updateReading);
router.delete('/:id', authenticateToken, deleteReading);

module.exports = router;
