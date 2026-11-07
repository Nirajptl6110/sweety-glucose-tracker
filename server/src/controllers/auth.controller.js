const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_SALT_ROUNDS = 10;
const EMAIL_UNIQUE_INDEX = 'users_email_lower_unique_idx';

async function register(req, res, next) {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  const validationErrors = {};

  if (!name) {
    validationErrors.name = 'Name is required.';
  }
  if (!email) {
    validationErrors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(email)) {
    validationErrors.email = 'Email must be a valid email address.';
  }
  if (!password) {
    validationErrors.password = 'Password is required.';
  } else if (password.length < 8) {
    validationErrors.password = 'Password must contain at least 8 characters.';
  }

  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Please correct the registration details.',
      error: {
        code: 'VALIDATION_ERROR',
        details: validationErrors,
      },
    });
  }

  try {
    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, passwordHash]
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: { user: result.rows[0] },
    });
  } catch (error) {
    if (error.code === '23505' && error.constraint === EMAIL_UNIQUE_INDEX) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
        error: { code: 'EMAIL_ALREADY_EXISTS' },
      });
    }

    return next(error);
  }
}

module.exports = { register };
