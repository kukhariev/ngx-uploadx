// @ts-check

const args = process.argv.slice(2);

const reset = args.includes('--reset');
const emitErrors = args.includes('--errors');
const exit = args.includes('--exit');

const DEV = process.env.NODE_ENV === 'development';
const PORT = 3003;
const http = require('http');
const url = require('url');
const { unlinkSync } = require('fs');
const { tmpdir } = require('os');
const { Uploadx, DiskStorage } = require('node-uploadx');

const maxChunkSize = '8MB';
const storage = new DiskStorage({ dest: (req, file) => `${tmpdir()}/ngx/${file.filename}` });
reset && resetStorageBeforeTest(storage);
exit && process.exit();

const uploads = new Uploadx({ storage, maxChunkSize });
uploads.on('error', console.error);
const server = http.createServer((req, res) => {
  if (emitErrors && Math.random() < 0.1 && req.method !== 'OPTIONS' && req.method !== 'DELETE') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.statusCode = 401;
    res.end();
    return;
  }
  const pathname = url.parse(req.url).pathname.toLowerCase();
  if (pathname === '/upload') {
    uploads.handle(req, res);
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
  DEV && console.log('listening on port:', PORT);
});
DEV && process.once('exit', () => console.log('exiting...'));
function resetStorageBeforeTest(storage) {
  const files = storage.metaStore.all;
  for (const id in files) {
    try {
      unlinkSync(files[id].path);
    } catch (err) {}
  }
  storage.metaStore.clear();
}

exports.reset = () => resetStorageBeforeTest(storage);
