import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from 'express-oauth2-jwt-bearer';

/**
 * Centralized error handler for authentication failures from
 * express-oauth2-jwt-bearer.
 *
 * Converts any UnauthorizedError (401/403) thrown by the JWT middleware into a
 * clean JSON response. No stack traces, no filesystem paths, no library
 * internals are exposed to the client.
 *
 * Non-authentication errors are forwarded to the next error handler unchanged.
 *
 * Must be registered AFTER all routes in the Express application.
 */
export const authErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err instanceof UnauthorizedError) {
    // Use the status carried by the error (401 for missing/invalid token,
    // 403 for insufficient scope). Never expose the original message or stack.
    res.status(err.status).json({ error: 'Unauthorized' });
    return;
  }

  // Not an auth error — pass to the next error handler (Express default or
  // any other registered handler).
  next(err);
};
