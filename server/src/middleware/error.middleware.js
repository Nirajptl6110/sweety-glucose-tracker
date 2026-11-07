function notFoundHandler(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  error.code = 'NOT_FOUND';
  next(error);
}

function errorHandler(error, req, res, next) {
  const status = error.status || 500;
  const isConfigurationError = status === 500 && error.code === 'JWT_CONFIGURATION_ERROR';

  res.status(status).json({
    success: false,
    message: isConfigurationError
      ? 'Authentication service is not configured.'
      : status === 500 ? 'Internal server error.' : error.message,
    error: {
      code: isConfigurationError
        ? 'SERVER_CONFIGURATION_ERROR'
        : status === 500 ? 'INTERNAL_SERVER_ERROR' : error.code || 'REQUEST_ERROR',
    },
  });
}

module.exports = { notFoundHandler, errorHandler };
