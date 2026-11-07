const { pool } = require('../config/db');

const ALLOWED_TIME_SLOTS = new Set([
  'morning',
  'after_breakfast',
  'after_lunch',
  'after_dinner',
]);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getApplicationDate() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const dateParts = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

function isRealCalendarDate(dateString) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1) {
    return false;
  }

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day <= daysInMonth;
}

async function getReadings(req, res, next) {
  const readingDate = req.query.reading_date;
  const timeSlot = req.query.time_slot;
  const validationErrors = {};

  if (readingDate !== undefined &&
      (typeof readingDate !== 'string' || !isRealCalendarDate(readingDate))) {
    validationErrors.reading_date = 'Reading date must be a real date in YYYY-MM-DD format.';
  }
  if (timeSlot !== undefined &&
      (typeof timeSlot !== 'string' || !ALLOWED_TIME_SLOTS.has(timeSlot))) {
    validationErrors.time_slot = 'Time slot must be one of the supported values.';
  }

  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Please correct the reading filters.',
      error: { code: 'VALIDATION_ERROR', details: validationErrors },
    });
  }

  const values = [req.user.id];
  const conditions = ['user_id = $1'];

  if (readingDate !== undefined) {
    values.push(readingDate);
    conditions.push(`reading_date = $${values.length}`);
  }
  if (timeSlot !== undefined) {
    values.push(timeSlot);
    conditions.push(`time_slot = $${values.length}`);
  }

  try {
    const result = await pool.query(
      `SELECT id, user_id, reading_date::text AS reading_date,
              time_slot, value, created_at, updated_at
       FROM readings
       WHERE ${conditions.join(' AND ')}
       ORDER BY reading_date DESC, created_at DESC`,
      values
    );

    return res.status(200).json({
      success: true,
      message: 'Readings retrieved successfully.',
      data: { readings: result.rows },
    });
  } catch (error) {
    return next(error);
  }
}

async function getReadingById(req, res, next) {
  const { id } = req.params;

  if (!UUID_PATTERN.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Reading ID must be a valid UUID.',
      error: { code: 'VALIDATION_ERROR' },
    });
  }

  try {
    const result = await pool.query(
      `SELECT id, user_id, reading_date::text AS reading_date,
              time_slot, value, created_at, updated_at
       FROM readings
       WHERE id = $1 AND user_id = $2
       LIMIT 1`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reading not found.',
        error: { code: 'READING_NOT_FOUND' },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Reading retrieved successfully.',
      data: { reading: result.rows[0] },
    });
  } catch (error) {
    return next(error);
  }
}

async function createReading(req, res, next) {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const validationErrors = {};
  const readingDate = typeof body.reading_date === 'string' ? body.reading_date : '';
  const timeSlot = typeof body.time_slot === 'string' ? body.time_slot : '';

  if (!readingDate) {
    validationErrors.reading_date = 'Reading date is required.';
  } else if (!isRealCalendarDate(readingDate)) {
    validationErrors.reading_date = 'Reading date must be a real date in YYYY-MM-DD format.';
  } else if (readingDate > getApplicationDate()) {
    validationErrors.reading_date = 'Reading date cannot be in the future.';
  }

  if (!timeSlot) {
    validationErrors.time_slot = 'Time slot is required.';
  } else if (!ALLOWED_TIME_SLOTS.has(timeSlot)) {
    validationErrors.time_slot = 'Time slot must be one of the supported values.';
  }

  if (body.value === undefined || body.value === null || body.value === '') {
    validationErrors.value = 'Value is required.';
  } else if (!Number.isInteger(body.value) || body.value < 40 || body.value > 600) {
    validationErrors.value = 'Value must be an integer between 40 and 600.';
  }

  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Please correct the reading details.',
      error: {
        code: 'VALIDATION_ERROR',
        details: validationErrors,
      },
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO readings (user_id, reading_date, time_slot, value)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, reading_date::text AS reading_date,
                 time_slot, value, created_at, updated_at`,
      [req.user.id, readingDate, timeSlot, body.value]
    );

    return res.status(201).json({
      success: true,
      message: 'Reading created successfully.',
      data: { reading: result.rows[0] },
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'A reading already exists for this date and time slot.',
        error: { code: 'READING_ALREADY_EXISTS' },
      });
    }

    return next(error);
  }
}

async function updateReading(req, res, next) {
  const { id } = req.params;

  if (!UUID_PATTERN.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Reading ID must be a valid UUID.',
      error: { code: 'VALIDATION_ERROR' },
    });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const validationErrors = {};
  const readingDate = typeof body.reading_date === 'string' ? body.reading_date : '';
  const timeSlot = typeof body.time_slot === 'string' ? body.time_slot : '';

  if (!readingDate) {
    validationErrors.reading_date = 'Reading date is required.';
  } else if (!isRealCalendarDate(readingDate)) {
    validationErrors.reading_date = 'Reading date must be a real date in YYYY-MM-DD format.';
  } else if (readingDate > getApplicationDate()) {
    validationErrors.reading_date = 'Reading date cannot be in the future.';
  }

  if (!timeSlot) {
    validationErrors.time_slot = 'Time slot is required.';
  } else if (!ALLOWED_TIME_SLOTS.has(timeSlot)) {
    validationErrors.time_slot = 'Time slot must be one of the supported values.';
  }

  if (body.value === undefined || body.value === null || body.value === '') {
    validationErrors.value = 'Value is required.';
  } else if (!Number.isInteger(body.value) || body.value < 40 || body.value > 600) {
    validationErrors.value = 'Value must be an integer between 40 and 600.';
  }

  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Please correct the reading details.',
      error: {
        code: 'VALIDATION_ERROR',
        details: validationErrors,
      },
    });
  }

  try {
    const result = await pool.query(
      `UPDATE readings
       SET reading_date = $1,
           time_slot = $2,
           value = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING id, user_id, reading_date::text AS reading_date,
                 time_slot, value, created_at, updated_at`,
      [readingDate, timeSlot, body.value, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reading not found.',
        error: { code: 'READING_NOT_FOUND' },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Reading updated successfully.',
      data: { reading: result.rows[0] },
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'A reading already exists for this date and time slot.',
        error: { code: 'READING_ALREADY_EXISTS' },
      });
    }

    return next(error);
  }
}

async function deleteReading(req, res, next) {
  const { id } = req.params;

  if (!UUID_PATTERN.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Reading ID must be a valid UUID.',
      error: { code: 'VALIDATION_ERROR' },
    });
  }

  try {
    const result = await pool.query(
      `DELETE FROM readings
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reading not found.',
        error: { code: 'READING_NOT_FOUND' },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Reading deleted successfully.',
      data: { id: result.rows[0].id },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createReading,
  getReadings,
  getReadingById,
  updateReading,
  deleteReading,
};
