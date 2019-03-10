'use strict';

// --------------------  FAKE AUTHORIZATION  MIDDLEWARE  --------------------
function auth(req, res, next) {
  if (!req.header('authorization')) {
    return next(403);
  } else {
    req.user = 'user1';
    return next();
  }
}
exports.auth = auth;
