import log from '../util/log/error';

import InternalServerError from '../util/error/InternalServerError';

/**
 * Returns a simplified error object.
 * @param {Error} error
 */
function simpleError(error) {
  switch (error.name) {
    case 'ValidationError':
    case 'RequestError':
    case 'UnauthorizedError':
    case 'ForbiddenError':
      error.isPublic = true;
  }

  if (!error.isPublic) error = new InternalServerError();

  return {
    error: {
      name: error.name,
      message: error.message,
      status: error.status,
      details: error.details,
    },
  };
}

/**
 * Error middleware.
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @param {Error} error
 */
export default function (error, req, res, next) {
  if (error) {
    log(error);

    const status = error.status || error.statusCode || 500;
    error.status = status;

    return res.status(status).json(simpleError(error));
  }
}
