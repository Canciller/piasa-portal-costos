import APIError from './APIError';

/**
 * Class representing a Validation Error.
 * @extends APIError
 */
class ValidationError extends APIError {
  /**
   * Creates a Validation Error.
   * @param {string} message
   * @param {Array} details
   */
  constructor(message = 'Validation Error', details = []) {
    super(message);
    this.details = details;
  }
}

export default ValidationError;
