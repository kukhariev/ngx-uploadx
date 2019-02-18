/*--------------------------------------------------------------
 *  Copyright (c) 2018, Oleg Kukhariev. All rights reserved.
 *  Licensed under the MIT License.
 *-------------------------------------------------------------*/

'use strict';

/*
 * Server API example
 */

const bytes = require('bytes');
const crypto = require('crypto');
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

// ----------------------------------  CONFIG  ---------------------------------

const UPLOADDIR = require('os').tmpdir();
const PORT = 3003;
const MAXUPLOADSIZE = bytes('2gb');
const MAXCHUNKSIZE = bytes('20mb');
const ALLOWMIME = ['video/*'];

// ----------------------------  CONFIGURE EXPRESS  ----------------------------
const app = express();
app.enable('trust proxy');
app.use(require('morgan')('dev', { skip: (req, res) => res.statusCode === 204 }));
const corsOptions = {
  exposedHeaders: ['Range', 'Location']
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
const rawBodyParser = bodyParser.raw({ limit: MAXCHUNKSIZE });

// -----------------------------  FAKE DATABASE  ----------------------------
const uploadsDB = (() => {
  const map = new Map();
  return {
    save: data => {
      const id = crypto
        .createHash('md5')
        .update(JSON.stringify(data), 'utf8')
        .digest('hex');
      data.id = id;
      map.set(id, data);
      return map.get(id);
    },
    ready: id => {
      console.log(`${map.get(id).dstpath}: upload complete`);
      map.delete(id);
    },
    findById: id => map.get(id)
  };
})();

// --------------------  FAKE AUTHORIZATION  MIDDLEWARE  --------------------
function auth(req, res, next) {
  if (!req.header('authorization')) {
    return next(403);
  } else {
    req.user = 'user1';
    return next();
  }
}

// ------------ get content ------------
app.put('/upload/', rawBodyParser, (req, res, next) => {
  if (!req.query.upload_id) {
    return next();
  }
  const upload_id = req.query.upload_id;
  const upload = uploadsDB.findById(upload_id);
  if (!upload) {
    return next(404);
  }
  // limit file/chunk size
  if (+req.get('content-length') > MAXCHUNKSIZE) {
    return next(413);
  }

  const contentRange = req.get('content-range');
  // -------- non chunking upload --------
  if (!contentRange) {
    return upload.fileStream.write(req.body, () => {
      upload.fileStream.end();
      uploadsDB.ready(upload_id);
      res.json(upload.metadata);
    });
  }
  // ---------- resume upload ----------
  if (contentRange.includes('*')) {
    const [, total] = contentRange.match(/\*\/(\d+)/g);
    if (+total === upload.fileStream.bytesWritten) {
      return res.json(upload.metadata);
    } else {
      res.set('Range', `bytes=0-${upload.fileStream.bytesWritten - 1}`);
      return res.status(308).send('Resume Incomplete');
    }
  }
  // --------- chunking upload ---------
  const [, , , total] = contentRange.match(/(\d+)-(\d+)\/(\d+)/).map(s => +s);
  if (upload.fileStream.bytesWritten < total) {
    upload.fileStream.write(req.body, () => {
      res.set('Range', `bytes=0-${upload.fileStream.bytesWritten - 1}`);
      return res.status(308).send('Resume Incomplete');
    });
  } else {
    return upload.fileStream.write(req.body, () => {
      res.json(upload.metadata);
      upload.fileStream.end();
      uploadsDB.ready(upload_id);
    });
  }
});

// ---------------------------  GENERATE SECURE LINK  --------------------------
app.use('/upload/', auth, (req, res, next) => {
  // optional: limit file size
  if (+req.get('x-upload-content-length') > MAXUPLOADSIZE) {
    return next(413);
  }
  // optional: check  mime type
  if (!new RegExp(ALLOWMIME.join('|')).test(req.get('x-upload-content-type'))) {
    return next(415);
  }
  const dstpath = path.join(UPLOADDIR, req.body.name || req.body.title);
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

  const location = `${req.protocol}://${req.hostname}:${PORT}/upload/${query}`;
  res.location(location);
  res.json(200, { location });
});

// ------------------------------  ERROR HANDLER  ------------------------------
// eslint-disable-next-line
app.use((err, req, res, next) => {
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
        code: err,
        message: errorStatuses[err]
      }
    });
  } else {
    console.error(err.stack);
    res.status(500).json({
      error: {
        code: err.code || 500,
        message: err.message
      }
    });
  }
});

const server = app.listen(PORT, 'localhost', () => {
  console.log(`Server listening on port: ${server.address().port}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});
