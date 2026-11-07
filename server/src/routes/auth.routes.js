const express = require('express');
const { register, login } = require('../controllers/auth.controller');
const authenticateToken = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authenticated user retrieved successfully.',
    data: { user: { id: req.user.id } },
  });
});

module.exports = router;
