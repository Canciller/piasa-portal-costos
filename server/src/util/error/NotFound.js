import APIError from './APIError';

/**
 * Class representing a Not Found Error.
 * @extends APIError
 */
class NotFound extends APIError {
  /**
   * Creates a Not Found Error.
   * @param {string} message
   * @param {number} status
   */
  constructor(message = 'Resource not found', status = 404) {
    super(message, status);
  }
}

export default NotFound;
