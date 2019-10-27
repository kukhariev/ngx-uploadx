const args = process.argv.slice(2);
const debug = args.includes('--debug');
const emitErrors = args.includes('--errors');
debug && (process.env.DEBUG = 'uploadx:*');

const http = require('http');
const url = require('url');
const { tmpdir } = require('os');
const { Uploadx, Tus, DiskStorage, Multipart } = require('node-uploadx');

const PORT = 3003;
const USER_ID = 'ngx-uploadx-test';
const UPLOADS_ROOT = `${tmpdir()}/${USER_ID}/`;
const storage = new DiskStorage({
  dest: (req, file) => `${UPLOADS_ROOT}/${file.filename}`,
  allowMIME: ['video/*', 'image/*']
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
  if (/^\/upload\W?/.test(pathname)) {
    req['user'] = { id: USER_ID };
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
  return storage.delete({ userId: USER_ID });
}

exports.reset = storageCleanup;
