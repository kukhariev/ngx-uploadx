// @ts-check

const args = process.argv.slice(2);
const debug = args.includes('--debug');
debug && (process.env.DEBUG = 'uploadx:*');
const url = require('url');
const { tmpdir } = require('os');
const { DiskStorage, Multipart, Tus, Uploadx } = require('@uploadx/core');
const { createServer } = require('http');

const PORT = 3002;
const UPLOAD_DIR = `${tmpdir()}/ngx-uploadx/`;

const opts = { directory: UPLOAD_DIR, path: '/files' };
const storage = new DiskStorage(opts);
const upx = new Uploadx({ storage });
const tus = new Tus({ storage });
const mpt = new Multipart({ storage });

const pathRegexp = new RegExp(`^${opts.path}([\/\?]|$)`);

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
}).listen(PORT);
