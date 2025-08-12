// Express static server for Vite build in ./out (ESM)
import express from 'express';
import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Env configuration
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';
const PRIMARY_DOMAIN = process.env.PRIMARY_DOMAIN || '';
const ENABLE_WWW_REDIRECT = (process.env.ENABLE_WWW_REDIRECT || 'true').toLowerCase() === 'true';
const FORCE_HTTPS = (process.env.FORCE_HTTPS || 'true').toLowerCase() === 'true';
const DEPLOY_TOKEN = process.env.DEPLOY_TOKEN || process.env.WEBHOOK_TOKEN || '';

// Ports
const HTTP_PORT = isProd ? 80 : (Number(process.env.PORT) || 8080);
const HTTPS_PORT = isProd ? (Number(process.env.PORT) || 443) : null;

// SSL options (only if prod and cert paths provided)
const keyPath = process.env.TLS_KEY;
const certPath = process.env.TLS_CERT;
const caPath = process.env.TLS_CA;

// Simple colored request logger
app.use((req, res, next) => {
  const start = Date.now();
  const ip = (req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || '').toString();
  res.on('finish', () => {
    const dur = Date.now() - start;
    const status = res.statusCode;
    const cRed = '\x1b[31m';
    const cYellow = '\x1b[33m';
    const cGreen = '\x1b[32m';
    const cCyan = '\x1b[36m';
    const cBlue = '\x1b[34m';
    const cMagenta = '\x1b[35m';
    const reset = '\x1b[0m';
    const statusColor = status >= 500 ? cRed : status >= 400 ? cYellow : cGreen;
    const now = new Date();
    const dateStr = now.toISOString();
    const parts = [
      `${cBlue}${dateStr}${reset}`,
      `${cCyan}${ip}${reset}`,
      `${cMagenta}${req.method}${reset}`,
      `${cMagenta}${req.originalUrl}${reset}`,
      `${statusColor}${status}${reset}`,
      `${cGreen}${dur}ms${reset}`,
    ];
    console.log(parts.join(' '));
  });
  next();
});

// Trust proxy so that req.secure works correctly behind proxies
app.enable('trust proxy');

// Redirect www -> non-www (if enabled and PRIMARY_DOMAIN specified)
if (ENABLE_WWW_REDIRECT && PRIMARY_DOMAIN) {
  app.use((req, res, next) => {
    const host = req.headers.host || '';
    if (host.startsWith('www.')) {
      const redirectTo = `${req.protocol}://${PRIMARY_DOMAIN}${req.originalUrl}`;
      return res.redirect(301, redirectTo);
    }
    next();
  });
}

// HTTP->HTTPS redirect in production (if forced)
if (isProd && FORCE_HTTPS) {
  app.use((req, res, next) => {
    if (!req.secure) {
      const host = req.headers.host ? req.headers.host.split(':')[0] : PRIMARY_DOMAIN || '';
      const url = `https://${host}${req.originalUrl}`;
      return res.redirect(301, url);
    }
    next();
  });
}

const outDir = path.resolve(__dirname, 'out');

// Serve static assets
app.use(express.static(outDir, { maxAge: '1h', extensions: ['html'] }));

// SPA fallback middleware: for any non-file request, send index.html
app.use((req, res, next) => {
  if (path.extname(req.path)) return next();
  res.sendFile(path.join(outDir, 'index.html'));
});

// Create servers depending on environment
if (isProd) {
  // In production: start both HTTP (for redirect) and HTTPS (main)
  if (!keyPath || !certPath) {
    console.error('TLS_KEY and TLS_CERT must be set in production');
    process.exit(1);
  }
  const options = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
    ...(caPath ? { ca: fs.readFileSync(caPath) } : {}),
  };
  // HTTPS server
  https.createServer(options, app).listen(HTTPS_PORT || 443, '0.0.0.0', () => {
    console.log(`HTTPS server running at https://0.0.0.0:${HTTPS_PORT || 443}`);
  });
  // HTTP redirect server (80)
  const httpApp = express();
  httpApp.enable('trust proxy');
  httpApp.use((req, res) => {
    const host = req.headers.host ? req.headers.host.split(':')[0] : PRIMARY_DOMAIN || '';
    const url = `https://${host}${req.originalUrl}`;
    res.redirect(301, url);
  });
  http.createServer(httpApp).listen(HTTP_PORT || 80, '0.0.0.0', () => {
    console.log(`HTTP redirect server running at http://0.0.0.0:${HTTP_PORT || 80}`);
  });
} else {
  // Development: single HTTP server on 8080 (or PORT)
  app.listen(HTTP_PORT, '0.0.0.0', () => {
    console.log(`Dev server running at http://0.0.0.0:${HTTP_PORT}`);
  });
}

// Parse JSON for webhook
app.use(express.json({ limit: '256kb' }));

// GitHub webhook: POST /deploy?token=секретный_ключ
app.post('/deploy', async (req, res) => {
  const token = (req.query.token || '').toString();
  if (!DEPLOY_TOKEN) {
    return res.status(500).json({ ok: false, error: 'DEPLOY_TOKEN is not configured on server' });
  }
  if (!token || token !== DEPLOY_TOKEN) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  const event = req.headers['x-github-event'];
  const delivery = req.headers['x-github-delivery'];
  console.log(`[deploy webhook] token ok, event=${event} delivery=${delivery}`);

  // Run full static rebuild: vite build -> out
  try {
    const { exec } = await import('node:child_process');
    const { promisify } = await import('node:util');
    const pexec = promisify(exec);
    console.log('[deploy webhook] starting build: bun run build');
    const { stdout, stderr } = await pexec('bun run build', { cwd: __dirname, env: process.env });
    if (stdout) console.log('[deploy webhook] build stdout:\n' + stdout);
    if (stderr) console.warn('[deploy webhook] build stderr:\n' + stderr);
    return res.json({ ok: true, message: 'Rebuilt successfully', event, delivery });
  } catch (err) {
    console.error('[deploy webhook] build failed', err);
    return res.status(500).json({ ok: false, error: 'Build failed' });
  }
});
