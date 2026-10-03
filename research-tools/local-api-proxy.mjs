// Local stand-in for api.palmsays.com while the real proxy is not live. Dev only, never deployed.
// Forwards http://localhost:8787/{auth,rest,functions,storage}/v1/* to the Supabase project.
// Usage: node research-tools/local-api-proxy.mjs   then open http://localhost:4321/account/?reading=live
import http from 'node:http';

const TARGET = 'https://oeuaauluqlqkuplulzsc.supabase.co';
const PORT = 8787;
const ALLOWED = /^\/(auth|rest|functions|storage)\/v1\//;
const ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;

function cors(req) {
  const origin = req.headers.origin ?? '';
  return ORIGIN.test(origin)
    ? {
        'access-control-allow-origin': origin,
        'access-control-allow-credentials': 'true',
        'access-control-allow-headers': req.headers['access-control-request-headers'] ?? '*',
        'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'access-control-expose-headers': 'content-range, x-supabase-api-version',
        vary: 'Origin',
      }
    : {};
}

http
  .createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, cors(req)).end();
      return;
    }
    if (!ALLOWED.test(req.url ?? '')) {
      res.writeHead(404, cors(req)).end('not allowed');
      return;
    }
    const body = ['GET', 'HEAD'].includes(req.method ?? '') ? undefined : Buffer.concat(await Array.fromAsync(req));
    const headers = { ...req.headers };
    delete headers.host;
    delete headers.origin;
    delete headers.referer;
    delete headers['accept-encoding'];
    try {
      const upstream = await fetch(TARGET + req.url, { method: req.method, headers, body });
      const out = Object.fromEntries([...upstream.headers].filter(([k]) => !/^(content-encoding|content-length|transfer-encoding|access-control-)/i.test(k)));
      res.writeHead(upstream.status, { ...out, ...cors(req) });
      res.end(Buffer.from(await upstream.arrayBuffer()));
    } catch (error) {
      res.writeHead(502, cors(req)).end(String(error));
    }
  })
  .listen(PORT, () => console.log(`local api proxy on http://localhost:${PORT} -> ${TARGET}`));
