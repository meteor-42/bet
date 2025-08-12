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
14|// Env configuration (always run in production mode)
15|const PRIMARY_DOMAIN = process.env.PRIMARY_DOMAIN || '';
16|const ENABLE_WWW_REDIRECT = (process.env.ENABLE_WWW_REDIRECT || 'true').toLowerCase() === 'true';
17|const FORCE_HTTPS = (process.env.FORCE_HTTPS || 'true').toLowerCase() === 'true';
18|const DEPLOY_TOKEN = process.env.DEPLOY_TOKEN || process.env.WEBHOOK_TOKEN || '';
19|
20|// Ports
21|const HTTP_PORT = 80;
22|const HTTPS_PORT = Number(process.env.PORT) || 443;
23|
24|// SSL options (cert paths must be provided)
25|const keyPath = process.env.TLS_KEY;
26|const certPath = process.env.TLS_CERT;
27|const caPath = process.env.TLS_CA;
28|
29|if (!keyPath || !certPath) {
30|  console.error('TLS_KEY and TLS_CERT must be set for production');
31|  process.exit(1);
32|}
33|
34|// Simple colored request logger
35|app.use((req, res, next) => {
36|  const start = Date.now();
37|  const ip = (req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || '').toString();
38|  res.on('finish', () => {
39|    const dur = Date.now() - start;
40|    const status = res.statusCode;
41|    const cRed = '\x1b[31m';
42|    const cYellow = '\x1b[33m';
43|    const cGreen = '\x1b[32m';
44|    const cCyan = '\x1b[36m';
45|    const cBlue = '\x1b[34m';
46|    const cMagenta = '\x1b[35m';
47|    const reset = '\x1b[0m';
48|    const statusColor = status >= 500 ? cRed : status >= 400 ? cYellow : cGreen;
49|    const now = new Date();
50|    const dateStr = now.toISOString();
51|    const parts = [
52|      `${cBlue}${dateStr}${reset}`,
53|      `${cCyan}${ip}${reset}`,
54|      `${cMagenta}${req.method}${reset}`,
55|      `${cMagenta}${req.originalUrl}${reset}`,
56|      `${statusColor}${status}${reset}`,
57|      `${cGreen}${dur}ms${reset}`,
58|    ];
59|    console.log(parts.join(' '));
60|  });
61|  next();
62|});
63|
64|// Trust proxy so that req.secure works correctly behind proxies
65|app.enable('trust proxy');
66|
67|// Parse JSON for webhook (must be before routes)
68|app.use(express.json({ limit: '256kb' }));
69|
70|// GitHub webhook: POST /deploy?token=секретный_ключ (register BEFORE redirects/static/fallback)
71|app.post('/deploy', async (req, res) => {
72|  const token = (req.query.token || '').toString();
73|  if (!DEPLOY_TOKEN) {
74|    return res.status(500).json({ ok: false, error: 'DEPLOY_TOKEN is not configured on server' });
75|  }
76|  if (!token || token !== DEPLOY_TOKEN) {
77|    return res.status(401).json({ ok: false, error: 'Unauthorized' });
78|  }
79|
80|  const event = req.headers['x-github-event'];
81|  const delivery = req.headers['x-github-delivery'];
82|  console.log(`[deploy webhook] token ok, event=${event} delivery=${delivery}`);
83|
84|  try {
85|    const { execFile } = await import('node:child_process');
86|    const { promisify } = await import('node:util');
87|    const pexecFile = promisify(execFile);
88|    console.log('[deploy webhook] starting deploy.sh');
89|    const scriptPath = path.join(__dirname, 'deploy.sh');
90|    const { stdout, stderr } = await pexecFile('bash', [scriptPath], { cwd: __dirname, env: process.env, timeout: 15 * 60 * 1000 });
91|    if (stdout) console.log('[deploy webhook] deploy stdout:\n' + stdout);
92|    if (stderr) console.warn('[deploy webhook] deploy stderr:\n' + stderr);
93|    return res.json({ ok: true, message: 'Rebuilt successfully', event, delivery });
94|  } catch (err) {
95|    console.error('[deploy webhook] deploy failed', err);
96|    return res.status(500).json({ ok: false, error: 'Deploy failed' });
97|  }
98|});
99|
100|// Redirect www -> non-www (if enabled and PRIMARY_DOMAIN specified), skip /deploy
101|if (ENABLE_WWW_REDIRECT && PRIMARY_DOMAIN) {
102|  app.use((req, res, next) => {
103|    if (req.path === '/deploy') return next();
104|    const host = req.headers.host || '';
105|    if (host.startsWith('www.')) {
106|      const redirectTo = `${req.protocol}://${PRIMARY_DOMAIN}${req.originalUrl}`;
107|      return res.redirect(301, redirectTo);
108|    }
109|    next();
110|  });
111|}
112|
113|// HTTP->HTTPS redirect (if forced), skip /deploy
114|if (FORCE_HTTPS) {
115|  app.use((req, res, next) => {
116|    if (req.path === '/deploy') return next();
115|    if (!req.secure) {
116|      const host = req.headers.host ? req.headers.host.split(':')[0] : PRIMARY_DOMAIN || '';
117|      const url = `https://${host}${req.originalUrl}`;
118|      return res.redirect(301, url);
119|    }
120|    next();
121|  });
122|}
123|
124|const outDir = path.resolve(__dirname, 'out');
125|
126|// Serve static assets with long cache for hashed assets
127|app.use('/assets', express.static(path.join(outDir, 'assets'), {
128|  immutable: true,
129|  maxAge: '1y',
130|}));
131|
132|// Serve other static files with shorter cache
133|app.use(express.static(outDir, { maxAge: '1h', extensions: ['html'] }));
134|
135|// SPA fallback middleware: for any non-file request (skip /deploy), send index.html with no-cache
136|app.get('*', (req, res, next) => {
137|  if (req.path === '/deploy') return next();
138|  if (path.extname(req.path)) return next();
139|  res.set('Cache-Control', 'no-cache');
140|  res.sendFile(path.join(outDir, 'index.html'));
141|});
142|
143|// Create HTTPS and HTTP redirect servers
144|const options = {
145|  key: fs.readFileSync(keyPath),
146|  cert: fs.readFileSync(certPath),
147|  ...(caPath ? { ca: fs.readFileSync(caPath) } : {}),
148|};
149|
150|https.createServer(options, app).listen(HTTPS_PORT, '0.0.0.0', () => {
151|  console.log(`HTTPS server running at https://0.0.0.0:${HTTPS_PORT}`);
152|});
153|
154|const httpApp = express();
155|httpApp.enable('trust proxy');
156|httpApp.use((req, res) => {
157|  const host = req.headers.host ? req.headers.host.split(':')[0] : PRIMARY_DOMAIN || '';
158|  const url = `https://${host}${req.originalUrl}`;
159|  res.redirect(301, url);
160|});
161|http.createServer(httpApp).listen(HTTP_PORT, '0.0.0.0', () => {
162|  console.log(`HTTP redirect server running at http://0.0.0.0:${HTTP_PORT}`);
163|});
