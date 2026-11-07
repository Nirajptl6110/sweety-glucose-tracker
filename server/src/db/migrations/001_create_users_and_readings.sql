-- Provides gen_random_uuid() on PostgreSQL versions where it is supplied by
-- the pgcrypto extension. PostgreSQL 13+ also provides it as a core function.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Stores one account per email address. The unique lower-case index below
-- makes email uniqueness case-insensitive (for example, A@x.com = a@x.com).
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enforce case-insensitive uniqueness without changing the email's stored case.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique_idx
    ON users (LOWER(email));

-- Stores a user's glucose value for one of the four supported daily time slots.
CREATE TABLE IF NOT EXISTS readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    reading_date DATE NOT NULL,
    time_slot VARCHAR(30) NOT NULL,
    value INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Deleting a user also deletes their readings.
    CONSTRAINT readings_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,

    -- Only these time slots are valid; values must stay within the supported range.
    CONSTRAINT readings_time_slot_check
        CHECK (time_slot IN ('morning', 'after_breakfast', 'after_lunch', 'after_dinner')),
    CONSTRAINT readings_value_check
        CHECK (value BETWEEN 40 AND 600),

    -- A user can have at most one reading per date and time slot.
    CONSTRAINT readings_user_date_time_slot_unique
        UNIQUE (user_id, reading_date, time_slot)
);

-- Speeds up looking up a user's readings by date.
CREATE INDEX IF NOT EXISTS readings_user_id_reading_date_idx
    ON readings (user_id, reading_date);
