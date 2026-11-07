function notFoundHandler(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  const status = error.status || 500;

  res.status(status).json({
    success: false,
    message: status === 500 ? 'Internal server error' : error.message,
  });
}

module.exports = { notFoundHandler, errorHandler };
