'use strict';
const dev = process.env['NODE_ENV'] === 'development';

function errorsInjector(req, res, next) {
  if (!dev) {
    return next()
  }
  if (Math.random() < 0.1) {
    // return req.socket.end();
    res.setHeader('Connection', 'close');
    return res.end();
  }
  if (Math.random() < 0.1) {
    return next(401);
  }
  if (Math.random() < 0.05) {
    return next(403);
  }
  if (Math.random() < 0.01) {
    return next(404);
  }
  return next();
}

exports.errorsInjector = errorsInjector;
