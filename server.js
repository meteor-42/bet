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

// Env configuration (always run in production mode)
const PRIMARY_DOMAIN = process.env.PRIMARY_DOMAIN || '';
const ENABLE_WWW_REDIRECT = (process.env.ENABLE_WWW_REDIRECT || 'true').toLowerCase() === 'true';
const FORCE_HTTPS = (process.env.FORCE_HTTPS || 'true').toLowerCase() === 'true';
const DEPLOY_TOKEN = process.env.DEPLOY_TOKEN || process.env.WEBHOOK_TOKEN || '';

// Ports
const HTTP_PORT = 80;
const HTTPS_PORT = Number(process.env.PORT) || 443;

// SSL options (cert paths must be provided)
const keyPath = process.env.TLS_KEY;
const certPath = process.env.TLS_CERT;
const caPath = process.env.TLS_CA;

if (!keyPath || !certPath) {
  console.error('TLS_KEY and TLS_CERT must be set for production');
  process.exit(1);
}

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

// Parse JSON for webhook (must be before routes)
app.use(express.json({ limit: '256kb' }));

// GitHub webhook: POST /deploy?token=секретный_ключ (register BEFORE redirects/static/fallback)
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
  const ip = (req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || '').toString();
  console.log(`deploy: request received ip=${ip} event=${event} delivery=${delivery}`);

  try {
    const { execFile } = await import('node:child_process');
    const { promisify } = await import('node:util');
    const pexecFile = promisify(execFile);

    // Ensure repo is in sync with origin/main before build (hard reset)
    console.log('deploy: git fetch');
    await pexecFile('git', ['fetch', '--all'], { cwd: __dirname, env: process.env });
    console.log('deploy: git reset --hard origin/main');
    await pexecFile('git', ['reset', '--hard', 'origin/main'], { cwd: __dirname, env: process.env });

    // Run deploy script (build)
    console.log('deploy: start');
    const scriptPath = path.join(__dirname, 'deploy.sh');
    const { stdout, stderr } = await pexecFile('bash', [scriptPath], { cwd: __dirname, env: process.env, timeout: 15 * 60 * 1000 });
    console.log('deploy: ok');
    return res.json({ ok: true, message: 'Rebuilt successfully', event, delivery });
  } catch (err) {
    console.error('deploy: failed');
    return res.status(500).json({ ok: false, error: 'Deploy failed' });
  }
});

// Redirect www -> non-www (if enabled and PRIMARY_DOMAIN specified), skip /deploy
if (ENABLE_WWW_REDIRECT && PRIMARY_DOMAIN) {
  app.use((req, res, next) => {
    if (req.path === '/deploy') return next();
    const host = req.headers.host || '';

    if (host.startsWith('www.')) {
      const redirectTo = `${req.protocol}://${PRIMARY_DOMAIN}${req.originalUrl}`;
      return res.redirect(301, redirectTo);
    }

    next();
  });
}

// HTTP->HTTPS redirect (if forced), skip /deploy
if (FORCE_HTTPS) {
  app.use((req, res, next) => {
    if (req.path === '/deploy') return next();

    if (!req.secure) {
      const host = req.headers.host ? req.headers.host.split(':')[0] : PRIMARY_DOMAIN || '';
      const url = `https://${host}${req.originalUrl}`;
      return res.redirect(301, url);
    }

    next();
  });
}

const outDir = path.resolve(__dirname, 'out');

// Serve static assets with long cache for hashed assets
app.use('/assets', express.static(path.join(outDir, 'assets'), {
  immutable: true,
  maxAge: '1y',
}));

// Serve other static files with shorter cache
app.use(express.static(outDir, {
  maxAge: '1h',
  extensions: ['html']
}));

// SPA fallback middleware: for any non-file request (skip /deploy), send index.html with no-cache
app.get('*', (req, res, next) => {
  if (req.path === '/deploy') return next();
  if (path.extname(req.path)) return next();

  res.set('Cache-Control', 'no-cache');
  res.sendFile(path.join(outDir, 'index.html'));
});

// Create HTTPS and HTTP redirect servers
const sslOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
  ...(caPath ? { ca: fs.readFileSync(caPath) } : {}),
};

https.createServer(sslOptions, app).listen(HTTPS_PORT, '0.0.0.0', () => {
  console.log(`HTTPS server running at https://0.0.0.0:${HTTPS_PORT}`);
});

const httpApp = express();
httpApp.enable('trust proxy');
httpApp.use((req, res) => {
  const host = req.headers.host ? req.headers.host.split(':')[0] : PRIMARY_DOMAIN || '';
  const url = `https://${host}${req.originalUrl}`;
  res.redirect(301, url);
});

http.createServer(httpApp).listen(HTTP_PORT, '0.0.0.0', () => {
  console.log(`HTTP redirect server running at http://0.0.0.0:${HTTP_PORT}`);
});
