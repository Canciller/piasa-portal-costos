import ExtendableError from './ExtendableError';

/**
 * Class representing an API error.
 * @extends ExtendableError
 */
class APIError extends ExtendableError {
  /**
   * Creates an API Error.
   * @param {string} message
   * @param {number} status
   * @param {boolean} isPublic
   */
  constructor(message = 'Bad Request', status = 400, isPublic = true) {
    super(message, status, isPublic);
  }
}

export default APIError;
