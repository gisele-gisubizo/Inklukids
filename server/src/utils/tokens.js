/**
 * JWT and refresh-token helpers (access tokens are stateless; refresh tokens are persisted by hash).
 */
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/** Short-lived access JWT (`sub` = user id, `role` for RBAC). */
function createAccessToken({ userId, role, secret, ttl }) {
  return jwt.sign({ sub: String(userId), role }, secret, { expiresIn: ttl });
}

/** Long-lived refresh JWT; returns `{ token, jti }` — store only `sha256(token)` in the database. */
function createRefreshToken({ userId, secret, ttlDays }) {
  const jti = crypto.randomBytes(24).toString('hex');
  const token = jwt.sign({ sub: String(userId), jti }, secret, { expiresIn: `${ttlDays}d` });
  return { token, jti };
}

function verifyRefreshToken(token, secret) {
  return jwt.verify(token, secret);
}

module.exports = {
  sha256,
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
};

