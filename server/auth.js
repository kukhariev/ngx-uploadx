// --------------------  FAKE AUTHORIZATION  MIDDLEWARE  --------------------
function auth(req, res, next) {
  if (!req.header('authorization')) {
    return next(403);
  } else {
    const [s, mark] = req
      .header('authorization')
      .slice(7)
      .trim()
      .split('token-');

    if (mark && Math.random() < 0.1) {
      return next(401);
    }
    req.user = 'user1';
    return next();
  }
}
exports.auth = auth;
