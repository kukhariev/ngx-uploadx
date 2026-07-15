// @ts-check
const { cors, DiskStorage, Multipart, Tus, Uploadx, fromEnv } = require('@uploadx/core');
const { createServer } = require('http');
const { tmpdir } = require('os');

const args = process.argv.slice(2);
const PORT = process.env.PORT || 3002;
const basePath = '/files';
const pathRegexp = new RegExp(`^${basePath}([/?]|$)`);

const config = {
  basePath: basePath,
  uploadDir: `${tmpdir()}/ngx-uploadx/`,
  maxFileSize: '2GB',
  expiration: '1h',
  ...fromEnv(),
  logLevel: /** @type { 'error' } */ (args.includes('--debug') ? 'debug' : 'error')
};

const corsHandler = cors();
const storage = new DiskStorage(config);
const uploadx = new Uploadx({ storage });
const tus = new Tus({ storage });
const multipart = new Multipart({ storage });

createServer((req, res) => {
  const { pathname, searchParams } = new URL(req.url ?? '', 'http://localhost');
  if (pathname === '/healthcheck') {
    const healthcheck = {
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      message: 'status 👍',
      timestamp: Date.now()
    };
    corsHandler(req, res, () => uploadx.send(res, { body: healthcheck }));
  } else if (pathname && pathRegexp.test(pathname)) {
    switch (searchParams.get('uploadType')) {
      case 'multipart':
        multipart.handle(req, res);
        break;
      case 'tus':
        tus.handle(req, res);
        break;
      default:
        uploadx.handle(req, res);
        break;
    }
  } else {
    corsHandler(req, res, () => uploadx.send(res, { body: 'Not Found', statusCode: 404 }));
  }
}).listen(PORT);
