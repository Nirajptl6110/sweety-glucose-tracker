const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_SALT_ROUNDS = 10;
const EMAIL_UNIQUE_INDEX = 'users_email_lower_unique_idx';
const INVALID_CREDENTIALS_RESPONSE = {
  success: false,
  message: 'Invalid email or password.',
  error: { code: 'INVALID_CREDENTIALS' },
};

async function login(req, res, next) {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const validationErrors = {};

  if (!email) {
    validationErrors.email = 'Email is required.';
  }
  if (!password) {
    validationErrors.password = 'Password is required.';
  }

  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.',
      error: {
        code: 'VALIDATION_ERROR',
        details: validationErrors,
      },
    });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    // This message contains configuration guidance only; it never includes credentials.
    console.error('JWT_SECRET is not configured. Set it in server/.env before using login.');
    const error = new Error('JWT_SECRET is not configured.');
    error.code = 'JWT_CONFIGURATION_ERROR';
    return next(error);
  }

  try {
    const result = await pool.query(
      `SELECT id, name, email, password_hash
       FROM users
       WHERE LOWER(email) = $1
       LIMIT 1`,
      [email]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json(INVALID_CREDENTIALS_RESPONSE);
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json(INVALID_CREDENTIALS_RESPONSE);
    }

    const token = jwt.sign(
      { sub: user.id },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: { id: user.id, name: user.name, email: user.email },
        token,
      },
    });
  } catch (error) {
    return next(error);
  }
}

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

module.exports = { register, login };
