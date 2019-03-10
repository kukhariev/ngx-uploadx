

const morgan = require('morgan');
morgan.token('bodySize', function(req, res) {
  return req.headers['content-length'];
});
const logger = morgan(
  function(tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.bodySize(req, res),
      tokens.res(req, res, 'content-length')
    ].join(' ');
  },
  { skip: (req, res) => res.statusCode === 204 }
);
exports.logger = logger;
