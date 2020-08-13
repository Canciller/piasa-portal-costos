import APIError from './APIError';

/**
 * Class representing an Unauthorized error.
 * @extends APIError
 */
class UnauthorizedError extends APIError {
  /**
   * Creates an Unauthorized error.
   * @param {string} message
   * @param {number} status
   */
  constructor(message = 'Unauthorized', status = 401) {
    super(message, status);
  }
}

export default UnauthorizedError;
