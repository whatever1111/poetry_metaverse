export function errorHandler(err, req, res, next) {
  // 兜底的错误处理中间件，采用统一 envelope
  const status = err.statusCode || 500;
  const code = err.code || (status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'FORBIDDEN' : status === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR');
  const message = err.message || '服务器内部错误';
  if (res.headersSent) return next(err);
  res.status(status).json({ error: { code, message } });
}


