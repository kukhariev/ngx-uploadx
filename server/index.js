// @ts-check

'use strict';

const { logger } = require('./logger');

/*
 *  uploads testing server
 *
 * https://github.com/kukhariev/node-uploadx
 *
 */

const bytes = require('bytes');
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const { uploadsDB } = require('./uploadsDB');
const { auth } = require('./auth');
const { errorsInjector } = require('./errorsInjector');

// ----------------------------------  CONFIG  ---------------------------------
const ENV = process.env['NODE_ENV'];
const UPLOAD_DIR = require('os').tmpdir();
const PORT = 3003;
const MAX_FILE_SIZE = bytes('2gb');
const MAX_CHUNK_SIZE = bytes('2mb');
const ALLOWED_MIME = ['video/*', 'image/*'];

// ----------------------------  CONFIGURE EXPRESS  ----------------------------
const app = express();
app.enable('trust proxy');

process.env['NODE_ENV'] === 'development' && app.use(logger);

const corsOptions = {
  exposedHeaders: ['Range', 'Location']
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
const rawBodyParser = bodyParser.raw({ limit: MAX_CHUNK_SIZE });

app.delete('/upload/', auth, del);
app.put('/upload/', errorsInjector, auth, rawBodyParser, fileChunk);
app.use('/upload/', errorsInjector, auth, newFile);

app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server listening on port: ${server.address()['port']}`);
  console.log('MAX_FILE_SIZE: ', MAX_FILE_SIZE);
  console.log('MAX_CHUNK_SIZE: ', MAX_CHUNK_SIZE);
});
process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});
// ----------------------------  MDLWRs  ----------------------------

/**
 *  Save chunk to disk and/or return offset for next chunk
 */
async function fileChunk(req, res, next) {
  if (!req.query.upload_id) {
    return next();
  }
  const upload_id = req.query.upload_id;
  const upload = uploadsDB.findById(upload_id);
  if (!upload) {
    return next(404);
  }
  // check file/chunk size limit
  if (+req.get('content-length') > MAX_CHUNK_SIZE) {
    return next(413);
  }
  res.set('Cache-Control', 'no-store');
  const contentRange = req.get('content-range');
  // -------- non chunking upload --------
  if (!contentRange) {
    return upload.fileStream.write(req.body, async () => {
      upload.fileStream.end();
      const md5 = await uploadsDB.ready(upload_id);
      res.json({ ...upload.metadata, md5 });
    });
  }
  // ---------- return offset for next chunk ----------
  if (contentRange.includes('*')) {
    const [, total] = contentRange.match(/\*\/(\d+)/g);
    if (+total === upload.fileStream.bytesWritten) {
      const md5 = await uploadsDB.ready(upload_id);
      res.json({ ...upload.metadata, md5 });
    } else {
      res.set('Range', `bytes=0-${upload.fileStream.bytesWritten - 1}`);
      return res.status(308).send('Resume Incomplete');
    }
  }
  // --------- append chunk data to file ---------
  const [fm, start, end, total] = contentRange.match(/(\d+)-(\d+)\/(\d+)/).map(s => +s);
  if (total !== upload.size) {
    return next(400);
  }
  if (end + 1 < total) {
    upload.fileStream.write(req.body, () => {
      res.set('Range', `bytes=0-${upload.fileStream.bytesWritten - 1}`);
      return res.status(308).send('Resume Incomplete');
    });
  } else {
    return upload.fileStream.write(req.body, async () => {
      upload.fileStream.end();
      const md5 = await uploadsDB.ready(upload_id);
      res.json({ ...upload.metadata, md5 });
    });
  }
}

/**
 *  Save chunk to disk || return offset for next chunk
 */
function newFile(req, res, next) {
  // optional: limit file size
  if (+req.get('x-upload-content-length') > MAX_FILE_SIZE) {
    return next(413);
  }
  // optional: check  mime type
  if (!new RegExp(ALLOWED_MIME.join('|')).test(req.get('x-upload-content-type'))) {
    return next(415);
  }
  const dstpath = path.join(UPLOAD_DIR, req.body.name || req.body.title);
  // overwrite file
  try {
    fs.unlinkSync(dstpath);
  } catch (error) {}

  // --------- register upload ---------
  const upload = {
    metadata: req.body,
    user: req.user,
    dstpath,
    size: +req.get('x-upload-content-length'),
    fileStream: fs.createWriteStream(dstpath, { flags: 'a' })
  };
  const upload_id = uploadsDB.save(upload).id;
  const query = `?upload_id=${upload_id}`;
  const location = `${req.protocol}://${req.hostname}:${PORT}${req.baseUrl}/${query}`;
  res.location(location);
  res.status(200).json({ location });
}

/**
 *  delete upload
 */
function del(req, res, next) {
  if (!req.query.upload_id) {
    return next(404);
  }
  const upload_id = req.query.upload_id;
  const upload = uploadsDB.findById(upload_id);
  if (!upload) {
    return next(404);
  }
  try {
    fs.unlinkSync(upload.dstpath);
    uploadsDB.deleted(upload_id);
  } catch (error) {}
  return res.json();
}

// ------------------------------  ERROR HANDLER  ------------------------------

function errorHandler(err, req, res, next) {
  const errorStatuses = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    413: 'Request Entity Too Large',
    415: 'Unsupported Media Type'
  };
  if (typeof err === 'number') {
    res.status(err).json({
      error: {
        statusCode: err,
        message: errorStatuses[err]
      }
    });
  } else {
    err.status && console.log(err);
    res.status(err.status).json({
      error: err
    });
  }
}
