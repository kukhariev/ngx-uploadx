const args = process.argv.slice(2);
const url = require('url');
const { tmpdir } = require('os');
const { DiskStorage, Multipart, Tus, Uploadx } = require('@uploadx/core');
const { createServer } = require('http');

const logLevel = process.env.LOG_LEVEL || args.includes('--debug') ? 'debug' : 'error';
const port = process.env.PORT || 3002;
const directory = process.env.UPLOAD_DIR || `${tmpdir()}/ngx-uploadx/`;
const maxUploadSize = process.env.MAX_UPLOAD_SIZE || '10GB';
const allowMIME = process.env.ALLOW_MIME?.split(',') || ['*/*'];
const path = '/files';

const pathRegexp = new RegExp(`^${path}([/?]|$)`);

const storage = new DiskStorage({
  directory,
  path,
  logLevel,
  maxUploadSize,
  allowMIME,
  expiration: { maxAge: '30min', purgeInterval: '5min' }
});
const upx = new Uploadx({ storage });
const tus = new Tus({ storage });
const mpt = new Multipart({ storage });

createServer((req, res) => {
  const { pathname, query = { uploadType: '' } } = url.parse(req.url, true);
  if (pathRegexp.test(pathname)) {
    switch (query.uploadType) {
      case 'multipart':
        mpt.handle(req, res);
        break;
      case 'tus':
        tus.handle(req, res);
        break;
      default:
        upx.handle(req, res);
        break;
    }
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.statusCode = 404;
    res.end();
  }
}).listen(port);
