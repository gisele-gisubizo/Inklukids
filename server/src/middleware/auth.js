const jwt = require('jsonwebtoken');

const BEARER_PREFIX = 'Bearer ';

/** Returns the JWT from `Authorization: Bearer <token>` or `null` if missing or malformed. */
function readBearerToken(authorizationHeader) {
  const value = authorizationHeader || '';
  if (!value.startsWith(BEARER_PREFIX)) return null;
  const token = value.slice(BEARER_PREFIX.length).trim();
  return token || null;
}

/** Express middleware: verifies access JWT and sets `req.auth` with `{ userId, role }`. */
function requireAuth({ accessSecret }) {
  return (req, res, next) => {
    const token = readBearerToken(req.headers.authorization);
    if (!token) return res.status(401).json({ message: 'Missing access token' });
    try {
      const payload = jwt.verify(token, accessSecret);
      req.auth = { userId: payload.sub, role: payload.role };
      return next();
    } catch {
      return res.status(401).json({ message: 'Invalid or expired access token' });
    }
  };
}

module.exports = { requireAuth, readBearerToken };

