import { auth } from 'express-oauth2-jwt-bearer';
import { Request, Response, NextFunction } from 'express';

/**
 * JWT validation middleware that FAILS CLOSED.
 *
 * If AUTH0_DOMAIN or AUTH0_AUDIENCE are absent when a protected route is
 * reached, the request is rejected with 503 Service Unavailable rather than
 * silently allowed through. Missing configuration is NOT permission to bypass
 * authentication.
 */
export const checkJwt = (req: Request, res: Response, next: NextFunction): void => {
  const domain = process.env.AUTH0_DOMAIN;
  const audience = process.env.AUTH0_AUDIENCE;

  if (!domain || !audience) {
    res.status(503).json({ error: 'Authentication service is not configured.' });
    return;
  }

  // Build a normalised issuerBaseURL: always https://<domain>/ with no
  // accidental double-protocol or missing trailing slash.
  const issuerBaseURL = domain.startsWith('http')
    ? domain.replace(/\/?$/, '/')
    : `https://${domain}/`;

  const jwtCheck = auth({
    audience,
    issuerBaseURL,
    tokenSigningAlg: 'RS256',
  });

  jwtCheck(req, res, next);
};
