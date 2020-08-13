/**
 * @extends Error
 */
class ExtendableError extends Error {
  /**
   * @param {string} message
   * @param {number} status
   * @param {boolean} isPublic
   */
  constructor(message, status, isPublic) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.status = status;
    this.isPublic = isPublic;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor.name);
  }
}

export default ExtendableError;
