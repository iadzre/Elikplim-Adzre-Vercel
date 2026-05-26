/**
 * Vite dev server middleware: POST /api/download-resource (same as Vercel).
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (not exposed to the client).
 */
export function downloadResourceDevApi() {
  return {
    name: 'download-resource-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split('?')[0];
        if (path !== '/api/download-resource' || req.method !== 'POST') {
          next();
          return;
        }

        try {
          const bodyText = await readRequestBody(req);
          const body = bodyText ? JSON.parse(bodyText) : {};

          const handler = (await import('../api/download-resource.js')).default;
          await handler(
            {
              method: 'POST',
              headers: { authorization: req.headers.authorization ?? '' },
              body,
            },
            createMockResponse(res)
          );
        } catch (err) {
          sendJson(res, 500, { error: err?.message ?? 'Download failed' });
        }
      });
    },
  };
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function createMockResponse(res) {
  return {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      sendJson(res, this.statusCode, payload);
    },
  };
}
