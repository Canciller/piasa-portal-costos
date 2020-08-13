import http from '../util/log/http';

/**
 * Logger middleware.
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
export default function (req, res, next) {
  http(req.method + ' ' + req.url);
  next();
}
