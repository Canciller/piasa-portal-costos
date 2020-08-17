import APIError from './APIError';

/**
 * Class representing a Not Found Error.
 * @extends APIError
 */
class NotFoundError extends APIError {
  /**
   * Creates a Not Found Error.
   * @param {string} message
   * @param {number} status
   */
  constructor(message = 'Not Found', status = 404) {
    super(message, status);
  }
}

export default NotFoundError;
