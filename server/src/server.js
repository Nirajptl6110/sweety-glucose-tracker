const path = require('path');
const dotenv = require('dotenv');

// Load the server's .env file regardless of the directory used to start npm.
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Sweety API is listening on port ${PORT}`);
});
