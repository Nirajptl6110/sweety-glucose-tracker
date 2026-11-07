const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const readingsRoutes = require('./routes/readings.routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/readings', readingsRoutes);

// Keep these after all routes so unmatched requests and errors are handled centrally.
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
