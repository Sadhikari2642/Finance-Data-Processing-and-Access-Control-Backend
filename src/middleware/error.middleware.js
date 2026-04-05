function errorHandler(err, req, res, next) {
  if (!err) return next();
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const payload = { message };
  if (process.env.NODE_ENV !== 'production' && err.stack) payload.stack = err.stack;
  res.status(status).json({ error: payload });
}

module.exports = { errorHandler };
