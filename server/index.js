const args = process.argv.slice(2);
const log = args.includes('--log');
const emitErrors = args.includes('--errors');
const exit = args.includes('--exit');

const http = require('http');
const url = require('url');
const { tmpdir } = require('os');

log && (process.env.DEBUG = 'uploadx:*');
const { Uploadx, Tus, DiskStorage } = require('node-uploadx');
const PORT = 3003;
const USER_ID = 'ngx-uploadx-test';
const UPLOADS_ROOT = `${tmpdir()}/${USER_ID}/`;

const user = { id: USER_ID };

const storage = new DiskStorage({ dest: (req, file) => `${UPLOADS_ROOT}/${file.filename}` });

exit && process.exit();

const uploadx = new Uploadx({ storage });
const tus = new Tus({ storage });

const server = http.createServer((req, res) => {
  if (emitErrors && Math.random() < 0.4 && req.method !== 'OPTIONS' && req.method !== 'DELETE') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.statusCode = Math.random() < 0.5 ? 401 : 500;
    res.end();
    return;
  }
  req['user'] = user;
  const { pathname } = url.parse(req.url);
  if (pathname === '/upload') {
    uploadx.handle(req, res);
  } else if (/^\/tus(\/.*|$)/.test(pathname)) {
    tus.handle(req, res);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.statusCode = 404;
    res.end();
  }
});

server.listen(PORT, error => {
  if (error) {
    return console.error('something bad happened', error);
  }
  log && console.log('listening on port:', PORT);
});

function storageCleanup() {
  return storage.delete({ userId: USER_ID });
}

exports.reset = storageCleanup;
