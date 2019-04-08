// @ts-check
const DEV = process.env.NODE_ENV === 'development';
const PORT = 3003;
const http = require('http');
const url = require('url');
const { unlinkSync } = require('fs');
const { tmpdir } = require('os');
const { Uploadx, DiskStorage } = require('node-uploadx');

const storage = new DiskStorage({ dest: (req, file) => `${tmpdir()}/ngx/${file.filename}` });
DEV && resetStorageBeforeTest(storage);

const uploads = new Uploadx({ storage });
uploads.on('error', console.error);
const server = http.createServer((req, res) => {
  if (DEV && Math.random() < 0.1 && req.method !== 'OPTIONS') {
    res.writeHead(401, { 'Content-Type': 'text/plan', 'Access-Control-Allow-Origin': '*' });
    res.end('Unauthorized');
    return;
  }
  const pathname = url.parse(req.url).pathname.toLowerCase();
  if (pathname === '/upload') {
    uploads.handle(req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plan' });
    res.end('Not Found');
  }
});

server.listen(PORT, error => {
  if (error) {
    return console.error('something bad happened', error);
  }
  DEV && console.log('listening on port:', PORT);
});

function resetStorageBeforeTest(storage) {
  const files = storage.metaStore.all;
  for (const id in files) {
    try {
      unlinkSync(files[id].path);
    } catch (err) {}
  }
  storage.metaStore.clear();
}
