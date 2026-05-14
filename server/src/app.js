/**
 * Express application factory: JSON body, CORS, cookies, and `/api/*` routers.
 * Caller supplies validated `env` (from `config/env`) and allowed `clientOrigin` (comma-separated allowed Origins).
 */
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { authRouter } = require('./routes/auth');
const { activitiesRouter } = require('./routes/activities');
const { progressRouter } = require('./routes/progress');
const { usersRouter } = require('./routes/users');
const { assignmentsRouter } = require('./routes/assignments');
const { messagesRouter } = require('./routes/messages');
const { trainingAssignmentsRouter } = require('./routes/trainingAssignments');
const { announcementsRouter } = require('./routes/announcements');
const { supportRouter } = require('./routes/support');

function parseClientOrigins(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function createApp({ clientOrigin, env }) {
  const app = express();
  app.locals.env = env;

  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  const allowedOrigins = parseClientOrigins(clientOrigin);
  app.use(cors({
    origin(origin, callback) {
      // Allow non-browser requests (no Origin header), e.g. health checks.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }));

  app.get('/health', (req, res) => {
    res.json({ ok: true, service: 'inklukids-server' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/activities', activitiesRouter);
  app.use('/api/progress', progressRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/assignments', assignmentsRouter);
  app.use('/api/messages', messagesRouter);
  app.use('/api/training-assignments', trainingAssignmentsRouter);
  app.use('/api/announcements', announcementsRouter);
  app.use('/api/support', supportRouter);

  return app;
}

module.exports = { createApp };

