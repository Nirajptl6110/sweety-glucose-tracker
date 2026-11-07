# Sweety — Blood Glucose Tracker

Sweety is a full-stack application for recording blood glucose readings and reviewing them over daily and monthly time periods. It was developed as a junior full-stack assignment using React, Express, and PostgreSQL.

The project aims to make personal glucose records easy to enter, review, and summarize. Sweety is a tracking tool; it does not diagnose conditions or provide medical advice.

## Features

- Account signup and login with hashed passwords.
- JWT authentication for account and reading operations.
- Create, view, update, and delete glucose readings for the signed-in user.
- Four reading slots per day: `morning`, `after_breakfast`, `after_lunch`, and `after_dinner`.
- Reading history filters by date and time slot.
- Daily, month-to-date, and previous-month reports with high, low, average, and count summaries.
- Dashboard with daily summaries and Recharts visualizations.
- Responsive dashboard, reading forms, history, and reports.

## Technology

| Area | Technologies |
|---|---|
| Frontend | React, Vite, React Router, Axios, Recharts, Lucide React |
| Backend | Node.js, Express.js, CommonJS modules |
| Database | PostgreSQL, `pg` connection pool |
| Authentication | JWT (`jsonwebtoken`), password hashing (`bcryptjs`) |
| Middleware | dotenv, CORS, Helmet |

## Project structure

```text
.
├── client/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── styles.css
│       ├── components/
│       ├── context/
│       ├── layouts/
│       ├── pages/
│       ├── services/
│       └── utils/
├── server/
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       │   ├── db.js
│       │   └── test-db.js
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── readings.controller.js
│       │   └── reports.controller.js
│       ├── db/
│       │   ├── seed.js
│       │   └── migrations/
│       │       └── 001_create_users_and_readings.sql
│       ├── middleware/
│       │   ├── auth.middleware.js
│       │   └── error.middleware.js
│       └── routes/
│           ├── auth.routes.js
│           ├── health.routes.js
│           ├── readings.routes.js
│           └── reports.routes.js
└── README.md
```

## Prerequisites

On Windows, install:

- Node.js 20 or newer with npm.
- PostgreSQL and a database user with permission to create the Sweety tables and the `pgcrypto` extension (or an administrator who can enable it).
- pgAdmin 4, if you want to apply the migration using its graphical Query Tool.

The frontend and backend run as separate development processes. The backend API defaults to port `5000`; Vite normally uses port `5173`.

## Database setup

1. In pgAdmin 4, connect to your PostgreSQL server and create a database, for example `sweety_glucose`.
2. Select that database and open **Tools → Query Tool**.
3. Open `server/src/db/migrations/001_create_users_and_readings.sql` in the Query Tool and execute it.
4. Refresh **Schemas → public → Tables**. The migration creates `users` and `readings` and their indexes and constraints.

The migration uses `CREATE ... IF NOT EXISTS` for the extension, tables, and indexes. It enables `pgcrypto` for UUID generation where needed. The readings table enforces the allowed time slots, glucose value range, user foreign key with cascading deletion, and one reading per user/date/time slot.

If `psql` is installed and available on `PATH`, you can also run the migration from the repository root:

```powershell
psql -U your_database_user -d your_database_name -f "server\src\db\migrations\001_create_users_and_readings.sql"
```

Replace the example database and user names with your local values. PostgreSQL will prompt for the database password.

## Backend setup

From PowerShell at the repository root:

```powershell
cd server
Copy-Item .env.example .env
npm ci
```

Edit `server/.env` and supply your local PostgreSQL connection settings and a private JWT signing secret. Keep `.env` local; it is ignored by Git. One way to generate a random secret in PowerShell is:

```powershell
$secretBytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Fill($secretBytes)
[Convert]::ToBase64String($secretBytes)
```

Copy the generated output into `JWT_SECRET` in `server/.env`; do not put it in source control or share it. Set `JWT_EXPIRES_IN` to a `jsonwebtoken`-supported expiry value such as `1d`.

### Backend environment variables

| Variable | Purpose | Example placeholder |
|---|---|---|
| `PORT` | Express server port | `5000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `your_database_name` |
| `DB_USER` | Database user | `your_database_user` |
| `DB_PASSWORD` | Database password | `your_database_password` |
| `JWT_SECRET` | Private token signing key | `your_long_random_secret_key_here` |
| `JWT_EXPIRES_IN` | Token lifetime | `1d` |

The checked-in `server/.env.example` contains placeholders only. The backend reads its `.env` file from `server/` even when started from another working directory.

To test the configured database connection (this runs `SELECT NOW()` and `SELECT current_database()` through the pool):

```powershell
npm run test:db
```

This command checks connectivity; it does not apply the migration. The migration is currently applied manually using pgAdmin or `psql`.

## Frontend setup

Open a second PowerShell window at the repository root:

```powershell
cd client
Copy-Item .env.example .env
npm ci
```

The `client/.env.example` sets the development API base URL:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

Change it only if the backend is hosted at another URL. Frontend variables exposed to Vite must not contain secrets.

## Run the application

Start the backend in the first terminal:

```powershell
cd F:\sweety-glucose-tracker\server
npm run dev
```

Start the frontend in the second terminal:

```powershell
cd F:\sweety-glucose-tracker\client
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`. The backend can be checked at `http://localhost:5000/api/health`.

Other available package scripts:

- Backend `npm start`: run Express without nodemon.
- Backend `npm run seed`: add the demo account and sample readings without replacing existing data.
- Backend `npm run test:db`: execute the database connection query.
- Frontend `npm run build`: create a production build in `client/dist/`.
- Frontend `npm run preview`: preview the production build locally after building.

The backend `npm test` script is currently a placeholder and exits with an error; there is no automated backend API test suite in the repository.

## Demo Account and Sample Data

The seed script creates this account for local evaluation:

- Demo email: [demo@sweety.app](mailto:demo@sweety.app)
- Demo password: `Demo@12345`

Run the seed command from the `server` directory after completing the PostgreSQL and backend setup:

```powershell
cd F:\sweety-glucose-tracker\server
npm run seed
```

The script hashes the password before storing it. It is safe to run repeatedly: it leaves an existing account unchanged and skips readings that already exist for the same user, date, and time slot. The demo credentials are for local evaluation only. If the demo email already belongs to an account, the script preserves that account's existing password.

## API reference

Base URL for local development: `http://localhost:5000/api`.

Protected endpoints require this header:

```http
Authorization: Bearer <JWT>
```

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| `GET` | `/health` | Public | API status and timestamp. |
| `POST` | `/auth/register` | Public | Create an account from `name`, `email`, and `password`. |
| `POST` | `/auth/login` | Public | Check `email` and `password`; returns user details and a JWT. |
| `GET` | `/auth/me` | JWT | Return the authenticated user ID. |
| `POST` | `/readings` | JWT | Create a reading from `reading_date`, `time_slot`, and `value`. |
| `GET` | `/readings` | JWT | List the signed-in user’s readings; optional `reading_date` and `time_slot` query filters. |
| `GET` | `/readings/:id` | JWT | Retrieve one of the signed-in user’s readings by UUID. |
| `PUT` | `/readings/:id` | JWT | Update a reading’s date, time slot, and value. |
| `DELETE` | `/readings/:id` | JWT | Delete a reading owned by the signed-in user. |
| `GET` | `/reports/daily?date=YYYY-MM-DD` | JWT | Daily statistics and readings in time-slot order. |
| `GET` | `/reports/month-to-date?date=YYYY-MM-DD` | JWT | Statistics from the first of the selected month through the selected date. |
| `GET` | `/reports/previous-month?date=YYYY-MM-DD` | JWT | Statistics for the full calendar month before the selected date’s month. |

Reading request example:

```json
{
  "reading_date": "2026-11-07",
  "time_slot": "morning",
  "value": 105
}
```

Reading routes return the created or updated reading under `data.reading`; list returns `data.readings`. Reports return aggregate fields in `data`, including `highest`, `lowest`, `average`, and `count`. Daily reports also include a `readings` array; period reports include `period_start` and `period_end`. When a report has no readings, the API returns success with a zero count and null aggregate values (and an empty daily readings array).

## Validation and security

- Passwords are hashed with bcryptjs before storage; login compares the submitted password with the stored hash.
- Signup normalizes email and the database has a case-insensitive unique email index.
- Login returns a JWT whose `sub` claim is the user ID. The client keeps the token in tab-scoped `sessionStorage` and attaches it as a Bearer token to protected API requests.
- Reading routes and reports use JWT authentication and scope database operations to the authenticated user ID.
- Reading dates must be real `YYYY-MM-DD` dates; create and update reject future dates using the `Asia/Kolkata` calendar date.
- Reading values must be integers from 40 through 600. Time slots are restricted to the four supported values.
- PostgreSQL queries use parameters for values. Unique user/date/time-slot conflicts return HTTP 409.
- Helmet and CORS are configured on the API. Unexpected server errors use centralized JSON error handling and do not return database details.
- `.env` files and `node_modules/` are excluded by the root `.gitignore`. Only placeholder environment examples belong in source control.

## Screenshots

The following are placeholders for screenshots to add to `docs/screenshots/`; no screenshots are included yet.

| Screen | Screenshot placeholder |
|---|---|
| Login | `docs/screenshots/01-login.png` |
| Signup | `docs/screenshots/02-signup.png` |
| Dashboard | `docs/screenshots/03-dashboard.png` |
| Reading history and filters | `docs/screenshots/04-reading-history.png` |
| Add or edit reading | `docs/screenshots/05-reading-form.png` |
| Reports | `docs/screenshots/06-reports.png` |

## Assumptions and limitations

- Glucose values are entered and displayed in mg/dL; unit conversion is not implemented.
- The app supports one account owner per reading, with no sharing, clinician, or administrator roles.
- Reading history currently has no pagination.
- The frontend stores the returned JWT in `sessionStorage`; authentication is cleared when the tab session ends or the API returns HTTP 401.
- Report summaries are informational and are not medical recommendations.
- The seed script supplies local demo data; there is no automated backend API test suite. `npm run test:db` checks database connectivity only.
- The database migration is a single SQL file and is run manually; no migration runner is configured.

## Future improvements

- Add automated backend integration tests.
- Add pagination and export for longer reading histories.
- Add trend and target-range options with clear, user-configurable units and context.
- Add password reset, email verification, and a managed token refresh/session flow.
- Add a migration runner and deployment-specific configuration guidance.
- Add accessibility checks, more frontend interaction tests, and screenshot documentation.
