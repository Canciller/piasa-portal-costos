import APIError from './APIError';

/**
 * Class representing an Unauthorized error.
 * @extends APIError
 */
class Forbidden extends APIError {
  /**
   * Creates an Unauthorized error.
   * @param {string} message
   * @param {number} status
   */
  constructor(message = 'Forbidden', status = 403) {
    super(message, status);
  }
}

export default Forbidden;
