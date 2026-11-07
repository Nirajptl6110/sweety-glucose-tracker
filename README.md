# Sweety — Blood Glucose Tracker

Sweety is a blood glucose tracking application. The repository is organized into a React client (`client/`) and a Node.js/Express API (`server/`). The API currently provides a health check; database, authentication, and glucose record features are not configured yet.

## Backend setup

Requirements: Node.js and npm.

1. Open a terminal in the `server/` directory.
2. Copy `.env.example` to `.env` and adjust `PORT` if needed. The default port is `5000`.
3. Install the dependencies declared in `package.json` with `npm install` (only needed if dependencies are not already installed).
4. Start the API:

   ```sh
   npm run dev
   ```

   Use `npm start` to run without automatic restarts.

The health endpoint is `GET http://localhost:5000/api/health` (replace `5000` if you set another port). It returns a JSON status, message, and current ISO timestamp. Unknown routes return a JSON 404 response.
