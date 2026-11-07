const jwt = require('jsonwebtoken');

function authenticationError(res) {
  return res.status(401).json({
    success: false,
    message: 'Authentication is required or the token is invalid.',
    error: { code: 'UNAUTHORIZED' },
  });
}

function authenticateToken(req, res, next) {
  const authorization = req.get('Authorization');
  const bearerMatch = typeof authorization === 'string'
    ? authorization.match(/^Bearer\s+(\S+)$/i)
    : null;

  if (!bearerMatch) {
    return authenticationError(res);
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const error = new Error('JWT_SECRET is not configured.');
    error.code = 'JWT_CONFIGURATION_ERROR';
    return next(error);
  }

  try {
    const payload = jwt.verify(bearerMatch[1], secret);

    if (!payload || typeof payload !== 'object' || typeof payload.sub !== 'string' || !payload.sub) {
      return authenticationError(res);
    }

    req.user = { id: payload.sub };
    return next();
  } catch (error) {
    // Do not reveal whether the token was expired, malformed, or signed incorrectly.
    return authenticationError(res);
  }
}

module.exports = authenticateToken;
