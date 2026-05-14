const express = require('express');
const bcrypt = require('bcryptjs');
const { z } = require('zod');

const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { sha256, createAccessToken, createRefreshToken, verifyRefreshToken } = require('../utils/tokens');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const RegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['teacher', 'parent', 'child', 'admin']),
  gradeLevel: z.string().optional(),
  teachesGrades: z.array(z.string().min(1)).optional(),
  children: z.array(z.object({
    name: z.string().min(1),
    age: z.coerce.number().optional(),
    grade: z.string().optional(),
    school: z.string().optional(),
    diagnosis: z.string().optional(),
    notes: z.string().optional(),
  })).optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/** SameSite / secure / path for the httpOnly refresh cookie (path scoped to auth routes). */
function refreshCookieShape(env) {
  const isProd = process.env.NODE_ENV === 'production';
  const crossSite = Boolean(env.REFRESH_COOKIE_CROSS_SITE);
  return {
    sameSite: crossSite ? 'none' : 'lax',
    secure: crossSite ? true : isProd,
    path: '/api/auth',
  };
}

function refreshCookieOptions(req, ttlDays, env) {
  const shape = refreshCookieShape(env);
  return {
    httpOnly: true,
    ...shape,
    maxAge: ttlDays * 24 * 60 * 60 * 1000,
  };
}

function safeUser(u) {
  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    children: u.children || [],
    gradeLevel: u.gradeLevel || '',
    teachesGrades: u.teachesGrades || [],
  };
}

router.post('/register', async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid request', errors: parsed.error.flatten() });

  const { name, email, password, role, children, gradeLevel, teachesGrades } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) return res.status(400).json({ message: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role,
    children: role === 'parent' ? (children || []) : [],
    gradeLevel: role === 'child' ? (gradeLevel || '').trim() : '',
    teachesGrades: role === 'teacher' ? (teachesGrades || []).map((g) => String(g).trim()).filter(Boolean) : [],
  });

  const accessToken = createAccessToken({
    userId: user._id,
    role: user.role,
    secret: req.app.locals.env.JWT_ACCESS_SECRET,
    ttl: req.app.locals.env.ACCESS_TOKEN_TTL,
  });

  const { token: refreshToken } = createRefreshToken({
    userId: user._id,
    secret: req.app.locals.env.JWT_REFRESH_SECRET,
    ttlDays: req.app.locals.env.REFRESH_TOKEN_TTL_DAYS,
  });
  const tokenHash = sha256(refreshToken);
  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + req.app.locals.env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
  });

  res.cookie('refreshToken', refreshToken, refreshCookieOptions(req, req.app.locals.env.REFRESH_TOKEN_TTL_DAYS, req.app.locals.env));
  return res.status(201).json({ user: safeUser(user), accessToken });
});

router.post('/login', async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid request', errors: parsed.error.flatten() });

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(400).json({ message: 'Invalid email or password' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ message: 'Invalid email or password' });

  const accessToken = createAccessToken({
    userId: user._id,
    role: user.role,
    secret: req.app.locals.env.JWT_ACCESS_SECRET,
    ttl: req.app.locals.env.ACCESS_TOKEN_TTL,
  });

  const { token: refreshToken } = createRefreshToken({
    userId: user._id,
    secret: req.app.locals.env.JWT_REFRESH_SECRET,
    ttlDays: req.app.locals.env.REFRESH_TOKEN_TTL_DAYS,
  });
  const tokenHash = sha256(refreshToken);
  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + req.app.locals.env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
  });

  res.cookie('refreshToken', refreshToken, refreshCookieOptions(req, req.app.locals.env.REFRESH_TOKEN_TTL_DAYS, req.app.locals.env));
  return res.json({ user: safeUser(user), accessToken });
});

router.post('/refresh', async (req, res) => {
  const rt = req.cookies.refreshToken;
  if (!rt) return res.status(401).json({ message: 'Missing refresh token' });

  try {
    verifyRefreshToken(rt, req.app.locals.env.JWT_REFRESH_SECRET);
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }

  const tokenHash = sha256(rt);
  const stored = await RefreshToken.findOne({ tokenHash });
  if (!stored) return res.status(401).json({ message: 'Refresh token not recognized' });
  if (stored.revokedAt) return res.status(401).json({ message: 'Refresh token revoked' });
  if (stored.expiresAt.getTime() < Date.now()) return res.status(401).json({ message: 'Refresh token expired' });

  const user = await User.findById(stored.userId);
  if (!user) return res.status(401).json({ message: 'User not found' });

  // rotate refresh token
  const { token: newRt } = createRefreshToken({
    userId: user._id,
    secret: req.app.locals.env.JWT_REFRESH_SECRET,
    ttlDays: req.app.locals.env.REFRESH_TOKEN_TTL_DAYS,
  });
  const newHash = sha256(newRt);

  stored.revokedAt = new Date();
  stored.replacedByTokenHash = newHash;
  await stored.save();

  await RefreshToken.create({
    userId: user._id,
    tokenHash: newHash,
    expiresAt: new Date(Date.now() + req.app.locals.env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
  });

  const accessToken = createAccessToken({
    userId: user._id,
    role: user.role,
    secret: req.app.locals.env.JWT_ACCESS_SECRET,
    ttl: req.app.locals.env.ACCESS_TOKEN_TTL,
  });

  res.cookie('refreshToken', newRt, refreshCookieOptions(req, req.app.locals.env.REFRESH_TOKEN_TTL_DAYS, req.app.locals.env));
  return res.json({ accessToken });
});

router.post('/logout', async (req, res) => {
  const rt = req.cookies.refreshToken;
  if (rt) {
    const tokenHash = sha256(rt);
    await RefreshToken.updateOne({ tokenHash }, { $set: { revokedAt: new Date() } });
  }
  res.clearCookie('refreshToken', refreshCookieShape(req.app.locals.env));
  return res.json({ ok: true });
});

router.get('/me', (req, res, next) => requireAuth({ accessSecret: req.app.locals.env.JWT_ACCESS_SECRET })(req, res, next), async (req, res) => {
  const user = await User.findById(req.auth.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ user: safeUser(user) });
});

module.exports = { authRouter: router };

