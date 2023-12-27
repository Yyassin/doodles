/**
 * Defines implementations of custom errors.
 * @author Yousef Yassin
 */

/**
 * Error denoting unsucessful task completion due to
 * a user-requested cancellation.
 */
export class AbortError extends DOMException {
  constructor(message = 'Request Aborted') {
    super(message, 'AbortError');
  }
}
