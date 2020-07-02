// @ts-check

const args = process.argv.slice(2);
const debug = args.includes('--debug');
debug && (process.env.DEBUG = 'uploadx:*');

const http = require('http');
const url = require('url');
const rimraf = require('rimraf');
const { tmpdir } = require('os');
const { Multipart, Tus, Uploadx } = require('node-uploadx');

const PORT = 3003;
const UPLOAD_DIR = `${tmpdir()}/ngx-uploadx/`;

const opts = {
  directory: UPLOAD_DIR,
  path: '/files'
};

const upx = new Uploadx(opts);
const tus = new Tus(opts);
const mpt = new Multipart(opts);

const server = http.createServer((req, res) => {
  const { pathname, query = {} } = url.parse(req.url, true);
  if (/^\/files\W?/.test(pathname)) {
    req['user'] = { id: query.uploadType };
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
});

server.listen(PORT);

function storageCleanup() {
  rimraf.sync(UPLOAD_DIR);
}

exports.reset = storageCleanup;
