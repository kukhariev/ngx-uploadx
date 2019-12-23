// @ts-check

const args = process.argv.slice(2);
const debug = args.includes('--debug');
const emitErrors = args.includes('--errors');
debug && (process.env.DEBUG = 'uploadx:*');

const http = require('http');
const url = require('url');
const { tmpdir } = require('os');
const { DiskStorage, Multipart, Tus, Uploadx } = require('node-uploadx');

const PORT = 3003;
const USER_PREFIX = 'tester';

const storage = new DiskStorage({
  directory: `${tmpdir()}/ngx-uploadx/`,
  allowMIME: ['video/*', 'image/*'],
  path: '/files'
});

const upx = new Uploadx({ storage });
const tus = new Tus({ storage });
const mpt = new Multipart({ storage });

const server = http.createServer((req, res) => {
  if (emitErrors && Math.random() < 0.4 && req.method !== 'OPTIONS' && req.method !== 'DELETE') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.statusCode = Math.random() < 0.5 ? 401 : 500;
    return res.end();
  }

  const { pathname, query = {} } = url.parse(req.url, true);
  if (/^\/files\W?/.test(pathname)) {
    req['user'] = { id: USER_PREFIX };
    if (query.uploadType === 'multipart') {
      mpt.handle(req, res);
    } else if (query.uploadType === 'tus') {
      tus.handle(req, res);
    } else {
      upx.handle(req, res);
    }
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.statusCode = 404;
    res.end();
  }
});

server.listen(PORT);

function storageCleanup() {
  return storage.delete(USER_PREFIX);
}

exports.reset = storageCleanup;
