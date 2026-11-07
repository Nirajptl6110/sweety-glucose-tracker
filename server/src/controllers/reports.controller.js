const { pool } = require('../config/db');

function isRealCalendarDate(dateString) {
  if (typeof dateString !== 'string') {
    return false;
  }

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

  return day <= new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function validateSelectedDate(req, res) {
  const date = req.query.date;

  if (!isRealCalendarDate(date)) {
    res.status(400).json({
      success: false,
      message: 'A valid date in YYYY-MM-DD format is required.',
      error: { code: 'VALIDATION_ERROR' },
    });
    return null;
  }

  return date;
}

function formatDate(year, month, day) {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getMonthToDateRange(selectedDate) {
  const [year, month] = selectedDate.split('-').map(Number);

  return {
    startDate: formatDate(year, month, 1),
    endDate: selectedDate,
  };
}

function getPreviousMonthRange(selectedDate) {
  let [year, month] = selectedDate.split('-').map(Number);

  if (month === 1) {
    year -= 1;
    month = 12;
  } else {
    month -= 1;
  }

  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  return {
    startDate: formatDate(year, month, 1),
    endDate: formatDate(year, month, daysInMonth[month - 1]),
  };
}

async function getDailyReport(req, res, next) {
  const selectedDate = validateSelectedDate(req, res);
  if (!selectedDate) {
    return;
  }

  try {
    const result = await pool.query(
      `WITH matching_readings AS (
         SELECT reading_date, time_slot, value
         FROM readings
         WHERE user_id = $1 AND reading_date = $2::date
       )
       SELECT MAX(value)::int AS highest,
              MIN(value)::int AS lowest,
              ROUND(AVG(value)::numeric, 1)::float8 AS average,
              COUNT(*)::int AS count,
              COALESCE(
                json_agg(
                  json_build_object(
                    'reading_date', reading_date::text,
                    'time_slot', time_slot,
                    'value', value
                  )
                  ORDER BY CASE time_slot
                    WHEN 'morning' THEN 1
                    WHEN 'after_breakfast' THEN 2
                    WHEN 'after_lunch' THEN 3
                    WHEN 'after_dinner' THEN 4
                  END
                ),
                '[]'::json
              ) AS readings
       FROM matching_readings`,
      [req.user.id, selectedDate]
    );

    const summary = result.rows[0];
    const hasReadings = summary.count > 0;

    return res.status(200).json({
      success: true,
      message: hasReadings ? 'Daily report generated successfully.' : 'No readings found for this date.',
      data: {
        date: selectedDate,
        highest: hasReadings ? summary.highest : null,
        lowest: hasReadings ? summary.lowest : null,
        average: hasReadings ? summary.average : null,
        count: summary.count,
        readings: hasReadings ? summary.readings : [],
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function getPeriodReport(req, res, next, range) {
  const selectedDate = validateSelectedDate(req, res);
  if (!selectedDate) {
    return;
  }

  const { startDate, endDate } = range(selectedDate);

  try {
    const result = await pool.query(
      `SELECT MAX(value)::int AS highest,
              MIN(value)::int AS lowest,
              ROUND(AVG(value)::numeric, 1)::float8 AS average,
              COUNT(*)::int AS count
       FROM readings
       WHERE user_id = $1
         AND reading_date >= $2::date
         AND reading_date <= $3::date`,
      [req.user.id, startDate, endDate]
    );

    const summary = result.rows[0];
    const hasReadings = summary.count > 0;

    return res.status(200).json({
      success: true,
      message: hasReadings ? 'Report generated successfully.' : 'No readings found for this period.',
      data: {
        period_start: startDate,
        period_end: endDate,
        highest: hasReadings ? summary.highest : null,
        lowest: hasReadings ? summary.lowest : null,
        average: hasReadings ? summary.average : null,
        count: summary.count,
      },
    });
  } catch (error) {
    return next(error);
  }
}

function getMonthToDateReport(req, res, next) {
  return getPeriodReport(req, res, next, getMonthToDateRange);
}

function getPreviousMonthReport(req, res, next) {
  return getPeriodReport(req, res, next, getPreviousMonthRange);
}

module.exports = {
  getDailyReport,
  getMonthToDateReport,
  getPreviousMonthReport,
};
