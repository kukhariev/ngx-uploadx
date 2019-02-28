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
      console.log(mark);

    if (mark && +mark !== new Date().getSeconds()) {
      return next(401);
    }
    req.user = 'user1';
    return next();
  }
}
exports.auth = auth;
