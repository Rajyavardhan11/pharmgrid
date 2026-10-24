import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, rename, stat } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const dataFile = join(root, 'data', 'pharmgrid.local.json');
const staticRoot = join(root, 'dist');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };

async function load() {
  try { return JSON.parse(await readFile(dataFile, 'utf8')); }
  catch { return { invoices: [], commands: {}, audit: [] }; }
}
async function save(data) {
  await mkdir(dirname(dataFile), { recursive: true });
  const temp = `${dataFile}.next`;
  await writeFile(temp, JSON.stringify(data, null, 2));
  await rename(temp, dataFile);
}
function fingerprint(body) { return createHash('sha256').update(JSON.stringify(body)).digest('hex'); }
function json(res, status, body) { res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }); res.end(JSON.stringify(body)); }
async function body(req) { let value = ''; for await (const chunk of req) value += chunk; return JSON.parse(value || '{}'); }
async function checkout(req, res) {
  const key = req.headers['idempotency-key'];
  if (!key || typeof key !== 'string') return json(res, 400, { code: 'IDEMPOTENCY_KEY_REQUIRED' });
  const payload = await body(req);
  if (!Array.isArray(payload.lines) || payload.lines.length === 0) return json(res, 400, { code: 'SALE_LINES_REQUIRED' });
  const hash = fingerprint(payload), data = await load(), prior = data.commands[key];
  if (prior) {
    if (prior.hash !== hash) return json(res, 409, { code: 'IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD' });
    return json(res, 200, { ...prior.response, replayed: true });
  }
  const totalPaise = payload.lines.reduce((sum, line) => sum + Number(line.unitPaise) * Number(line.quantity), 0);
  if (!Number.isSafeInteger(totalPaise) || totalPaise <= 0) return json(res, 400, { code: 'INVALID_MONEY_OR_QUANTITY' });
  const invoice = { invoiceId: `INV-${String(data.invoices.length + 1030).padStart(4, '0')}`, checkoutId: randomUUID(), totalPaise, businessDate: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date()), synthetic: true };
  const response = { invoice, replayed: false, safety: 'LOCAL_DEMO_NOT_POSTGRES' };
  data.invoices.push(invoice); data.commands[key] = { hash, response }; data.audit.push({ at: new Date().toISOString(), type: 'SALE_COMMITTED_LOCAL_DEMO', key, invoiceId: invoice.invoiceId });
  await save(data);
  return json(res, 201, response);
}
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (req.method === 'GET' && url.pathname === '/api/health') return json(res, 200, { status: 'ok', store: 'local-json-demo', aws: 'NOT_VERIFIED' });
    if (url.pathname.startsWith('/api/')) return json(res, 503, { code: 'LEGACY_DEMO_API_DISABLED', detail: 'Use the Docker PostgreSQL/FastAPI stack; it enforces authenticated API access.' });
    if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 404, { code: 'NOT_FOUND' });
    let target = url.pathname === '/' ? '/index.html' : url.pathname;
    if (target.includes('..')) return json(res, 400, { code: 'BAD_PATH' });
    const file = join(staticRoot, target);
    try { await stat(file); const content = await readFile(file); res.writeHead(200, { 'content-type': mime[extname(file)] || 'application/octet-stream' }); res.end(content); }
    catch { const content = await readFile(join(staticRoot, 'index.html')); res.writeHead(200, { 'content-type': mime['.html'] }); res.end(content); }
  } catch (error) { json(res, 500, { code: 'LOCAL_SERVER_ERROR', detail: error instanceof Error ? error.message : 'unknown' }); }
});
server.listen(process.env.PORT || 4173, '127.0.0.1', () => console.log(`PharmGrid local demo: http://127.0.0.1:${process.env.PORT || 4173}`));
