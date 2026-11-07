const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const DEMO_USER = {
  name: 'Sweety Demo',
  email: 'demo@sweety.app',
  password: 'Demo@12345',
};

const SALT_ROUNDS = 10;
const TIME_SLOTS = [
  'morning',
  'after_breakfast',
  'after_lunch',
  'after_dinner',
];

// Each row contains one day's readings in TIME_SLOTS order.
const SAMPLE_VALUES = [
  [96, 134, 121, 112],
  [101, 142, 128, 118],
  [94, 129, 116, 107],
  [104, 148, 132, 123],
  [98, 137, 124, 115],
];
const SAMPLE_DAYS_AGO = [0, 1, 2, 4, 6];

function getTodayInApplicationTimezone() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const dateParts = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

function getDateDaysAgo(today, daysAgo) {
  const date = new Date(`${today}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

async function getOrCreateDemoUser() {
  const passwordHash = await bcrypt.hash(DEMO_USER.password, SALT_ROUNDS);
  const insertedUser = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     ON CONFLICT (LOWER(email)) DO NOTHING
     RETURNING id`,
    [DEMO_USER.name, DEMO_USER.email, passwordHash]
  );

  if (insertedUser.rows.length > 0) {
    console.log('Created the Sweety demo account.');
    return insertedUser.rows[0].id;
  }

  // Keep an existing account's name, email casing, and password unchanged.
  const existingUser = await pool.query(
    `SELECT id
     FROM users
     WHERE LOWER(email) = LOWER($1)
     LIMIT 1`,
    [DEMO_USER.email]
  );

  if (existingUser.rows.length === 0) {
    throw new Error('The demo account could not be found after checking for an existing email.');
  }

  console.log('The Sweety demo account already exists; leaving it unchanged.');
  return existingUser.rows[0].id;
}

async function insertSampleReadings(userId) {
  const today = getTodayInApplicationTimezone();
  let insertedCount = 0;

  for (let dayIndex = 0; dayIndex < SAMPLE_DAYS_AGO.length; dayIndex += 1) {
    const readingDate = getDateDaysAgo(today, SAMPLE_DAYS_AGO[dayIndex]);

    for (let slotIndex = 0; slotIndex < TIME_SLOTS.length; slotIndex += 1) {
      const result = await pool.query(
        `INSERT INTO readings (user_id, reading_date, time_slot, value)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT ON CONSTRAINT readings_user_date_time_slot_unique DO NOTHING
         RETURNING id`,
        [userId, readingDate, TIME_SLOTS[slotIndex], SAMPLE_VALUES[dayIndex][slotIndex]]
      );

      insertedCount += result.rowCount;
    }
  }

  console.log(`Inserted ${insertedCount} sample reading(s); existing readings were preserved.`);
}

async function runSeed() {
  let failed = false;

  try {
    const userId = await getOrCreateDemoUser();
    await insertSampleReadings(userId);
    console.log('Database seed completed successfully.');
  } catch (error) {
    failed = true;
    const details = [error.message, error.code ? `(${error.code})` : '']
      .filter(Boolean)
      .join(' ');
    console.error('Database seed failed:', details || error.name || 'Unknown error');
  } finally {
    try {
      await pool.end();
      console.log('PostgreSQL connection pool closed.');
    } catch (error) {
      failed = true;
      const details = [error.message, error.code ? `(${error.code})` : '']
        .filter(Boolean)
        .join(' ');
      console.error(
        'Could not close the PostgreSQL connection pool:',
        details || error.name || 'Unknown error'
      );
    }
  }

  if (failed) {
    process.exitCode = 1;
  }
}

runSeed();
