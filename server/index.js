// @ts-check
const args = process.argv.slice(2);
const url = require('url');
const { tmpdir } = require('os');
const { DiskStorage, Multipart, Tus, Uploadx, cors } = require('@uploadx/core');
const { createServer } = require('http');

const port = process.env.PORT || 3002;
const path = '/files';
const pathRegexp = new RegExp(`^${path}([/?]|$)`);
const corsHandler = cors();

const config = {
  path,
  directory: process.env.UPLOAD_DIR || `${tmpdir()}/ngx-uploadx/`,
  allowMIME: process.env.ALLOW_MIME?.split(',') || ['*/*'],
  maxUploadSize: process.env.MAX_UPLOAD_SIZE || '10GB',
  expiration: { maxAge: process.env.MAX_AGE || '1h', purgeInterval: '10min' },
  logLevel: /** @type { 'info' } */ (
    process.env.LOG_LEVEL || args.includes('--debug') ? 'debug' : 'error'
  )
};

const storage = new DiskStorage(config);
const uploadx = new Uploadx({ storage });
const multipart = new Multipart({ storage });
const tus = new Tus({ storage });

createServer((req, res) => {
  const { pathname, query = { uploadType: '' } } = url.parse(req.url ?? '', true);
  if (pathname && pathRegexp.test(pathname)) {
    switch (query.uploadType) {
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
}).listen(port);
