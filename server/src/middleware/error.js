import log from '../util/log/error';

import InternalServerError from '../util/error/InternalServerError';

function simpleError(error) {
  switch (error.name) {
    case 'ValidationError':
    case 'RequestError':
    case 'UnauthorizedError':
      error.isPublic = true;
  }

  if (!error.isPublic) error = new InternalServerError();

  return {
    success: false,
    error: {
      name: error.name,
      message: error.message,
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

    return res.status(status).json(simpleError(error));
  }
}
