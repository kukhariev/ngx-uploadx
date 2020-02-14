// @ts-check

const args = process.argv.slice(2);
const debug = args.includes('--debug');
const emitErrors = args.includes('--errors');
debug && (process.env.DEBUG = 'uploadx:*');

const http = require('http');
const url = require('url');
const rimraf = require('rimraf');
const { tmpdir } = require('os');
const { Multipart, Tus, Uploadx } = require('node-uploadx');

const PORT = 3003;
const USER_PREFIX = 'tester';
const UPLOAD_DIR = `${tmpdir()}/ngx-uploadx/`;

const opts = {
  directory: UPLOAD_DIR,
  allowMIME: ['video/*', 'image/*'],
  path: '/files'
};

const upx = new Uploadx(opts);
const tus = new Tus(opts);
const mpt = new Multipart(opts);

const server = http.createServer((req, res) => {
  if (emitErrors && Math.random() < 0.4 && req.method !== 'OPTIONS' && req.method !== 'DELETE') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.statusCode = Math.random() < 0.5 ? 401 : 500;
    return res.end();
  }

  const { pathname, query = {} } = url.parse(req.url, true);
  if (/^\/files\W?/.test(pathname)) {
    req['user'] = { id: query.uploadType };
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
  rimraf.sync(UPLOAD_DIR);
}

exports.reset = storageCleanup;
