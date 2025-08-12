1|// Express static server for Vite build in ./out (ESM)
2|import express from 'express';
3|import path from 'path';
4|import fs from 'fs';
5|import http from 'http';
6|import https from 'https';
7|import { fileURLToPath } from 'url';
8|
9|const __filename = fileURLToPath(import.meta.url);
10|const __dirname = path.dirname(__filename);
11|
12|const app = express();
13|
14|// Env configuration
15|const NODE_ENV = process.env.NODE_ENV || 'development';
16|const isProd = NODE_ENV === 'production';
17|const PRIMARY_DOMAIN = process.env.PRIMARY_DOMAIN || '';
18|const ENABLE_WWW_REDIRECT = (process.env.ENABLE_WWW_REDIRECT || 'true').toLowerCase() === 'true';
19|const FORCE_HTTPS = (process.env.FORCE_HTTPS || 'true').toLowerCase() === 'true';
20|const DEPLOY_TOKEN = process.env.DEPLOY_TOKEN || process.env.WEBHOOK_TOKEN || '';
21|
22|// Ports
23|const HTTP_PORT = isProd ? 80 : (Number(process.env.PORT) || 8080);
24|const HTTPS_PORT = isProd ? (Number(process.env.PORT) || 443) : null;
25|
26|// SSL options (only if prod and cert paths provided)
27|const keyPath = process.env.TLS_KEY;
28|const certPath = process.env.TLS_CERT;
29|const caPath = process.env.TLS_CA;
30|
31|// Simple colored request logger
32|app.use((req, res, next) => {
33|  const start = Date.now();
34|  const ip = (req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || '').toString();
35|  res.on('finish', () => {
36|    const dur = Date.now() - start;
37|    const status = res.statusCode;
38|    const cRed = '\x1b[31m';
39|    const cYellow = '\x1b[33m';
40|    const cGreen = '\x1b[32m';
41|    const cCyan = '\x1b[36m';
42|    const cBlue = '\x1b[34m';
43|    const cMagenta = '\x1b[35m';
44|    const reset = '\x1b[0m';
45|    const statusColor = status >= 500 ? cRed : status >= 400 ? cYellow : cGreen;
46|    const now = new Date();
47|    const dateStr = now.toISOString();
48|    const parts = [
49|      `${cBlue}${dateStr}${reset}`,
50|      `${cCyan}${ip}${reset}`,
51|      `${cMagenta}${req.method}${reset}`,
52|      `${cMagenta}${req.originalUrl}${reset}`,
53|      `${statusColor}${status}${reset}`,
54|      `${cGreen}${dur}ms${reset}`,
55|    ];
56|    console.log(parts.join(' '));
57|  });
58|  next();
59|});
60|
61|// Trust proxy so that req.secure works correctly behind proxies
62|app.enable('trust proxy');
63|
64|// Parse JSON for webhook (must be before routes)
65|app.use(express.json({ limit: '256kb' }));
66|
67|// GitHub webhook: POST /deploy?token=секретный_ключ (register BEFORE redirects/static/fallback)
68|app.post('/deploy', async (req, res) => {
69|  const token = (req.query.token || '').toString();
70|  if (!DEPLOY_TOKEN) {
71|    return res.status(500).json({ ok: false, error: 'DEPLOY_TOKEN is not configured on server' });
72|  }
73|  if (!token || token !== DEPLOY_TOKEN) {
74|    return res.status(401).json({ ok: false, error: 'Unauthorized' });
75|  }
76|
77|  const event = req.headers['x-github-event'];
78|  const delivery = req.headers['x-github-delivery'];
79|  console.log(`[deploy webhook] token ok, event=${event} delivery=${delivery}`);
80|
81|  // Run full static rebuild: vite build -> out
82|  try {
83|    const { exec } = await import('node:child_process');
84|    const { promisify } = await import('node:util');
85|    const pexec = promisify(exec);
86|    console.log('[deploy webhook] starting build: bun run build');
87|    const { stdout, stderr } = await pexec('bun run build', { cwd: __dirname, env: process.env });
88|    if (stdout) console.log('[deploy webhook] build stdout:\n' + stdout);
89|    if (stderr) console.warn('[deploy webhook] build stderr:\n' + stderr);
90|    return res.json({ ok: true, message: 'Rebuilt successfully', event, delivery });
91|  } catch (err) {
92|    console.error('[deploy webhook] build failed', err);
93|    return res.status(500).json({ ok: false, error: 'Build failed' });
94|  }
95|});
96|
97|// Redirect www -> non-www (if enabled and PRIMARY_DOMAIN specified), skip /deploy
98|if (ENABLE_WWW_REDIRECT && PRIMARY_DOMAIN) {
99|  app.use((req, res, next) => {
100|    if (req.path === '/deploy') return next();
101|    const host = req.headers.host || '';
102|    if (host.startsWith('www.')) {
103|      const redirectTo = `${req.protocol}://${PRIMARY_DOMAIN}${req.originalUrl}`;
104|      return res.redirect(301, redirectTo);
105|    }
106|    next();
107|  });
108|}
109|
110|// HTTP->HTTPS redirect in production (if forced), skip /deploy
111|if (isProd && FORCE_HTTPS) {
112|  app.use((req, res, next) => {
113|    if (req.path === '/deploy') return next();
114|    if (!req.secure) {
115|      const host = req.headers.host ? req.headers.host.split(':')[0] : PRIMARY_DOMAIN || '';
116|      const url = `https://${host}${req.originalUrl}`;
117|      return res.redirect(301, url);
118|    }
119|    next();
120|  });
121|}
122|
123|const outDir = path.resolve(__dirname, 'out');
124|
125|// Serve static assets with long cache for hashed assets
126|app.use('/assets', express.static(path.join(outDir, 'assets'), {
127|  immutable: true,
128|  maxAge: '1y',
129|}));
130|
131|// Serve other static files with shorter cache
132|app.use(express.static(outDir, { maxAge: '1h', extensions: ['html'] }));
133|
134|// SPA fallback middleware: for any non-file request (skip /deploy), send index.html with no-cache
135|app.get('*', (req, res, next) => {
136|  if (req.path === '/deploy') return next();
137|  if (path.extname(req.path)) return next();
138|  res.set('Cache-Control', 'no-cache');
139|  res.sendFile(path.join(outDir, 'index.html'));
140|});
141|
142|// Create servers depending on environment
143|if (isProd) {
144|  // In production: start both HTTP (for redirect) and HTTPS (main)
145|  if (!keyPath || !certPath) {
146|    console.error('TLS_KEY and TLS_CERT must be set in production');
147|    process.exit(1);
148|  }
149|  const options = {
150|    key: fs.readFileSync(keyPath),
151|    cert: fs.readFileSync(certPath),
152|    ...(caPath ? { ca: fs.readFileSync(caPath) } : {}),
153|  };
154|  // HTTPS server
155|  https.createServer(options, app).listen(HTTPS_PORT || 443, '0.0.0.0', () => {
156|    console.log(`HTTPS server running at https://0.0.0.0:${HTTPS_PORT || 443}`);
157|  });
158|  // HTTP redirect server (80)
159|  const httpApp = express();
160|  httpApp.enable('trust proxy');
161|  httpApp.use((req, res) => {
162|    // Allow direct webhook on HTTP if needed? Prefer HTTPS: keep redirect.
163|    const host = req.headers.host ? req.headers.host.split(':')[0] : PRIMARY_DOMAIN || '';
164|    const url = `https://${host}${req.originalUrl}`;
165|    res.redirect(301, url);
166|  });
167|  http.createServer(httpApp).listen(HTTP_PORT || 80, '0.0.0.0', () => {
168|    console.log(`HTTP redirect server running at http://0.0.0.0:${HTTP_PORT || 80}`);
169|  });
170|} else {
171|  // Development: single HTTP server on 8080 (or PORT)
172|  app.listen(HTTP_PORT, '0.0.0.0', () => {
173|    console.log(`Dev server running at http://0.0.0.0:${HTTP_PORT}`);
174|  });
175|}
