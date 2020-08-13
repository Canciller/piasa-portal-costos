import ExtendableError from './ExtendableError';

/**
 * Class representing a Server Error.
 * @extends ExtendableError
 */
class InternalServerError extends ExtendableError {
  /**
   * Creates a Server Error.
   * @param {string} message
   * @param {number} status
   * @param {boolean} isPublic
   */
  constructor(
    message = 'Internal Server Error',
    status = 500,
    isPublic = false
  ) {
    super(message, status, isPublic);
  }
}

export default InternalServerError;
