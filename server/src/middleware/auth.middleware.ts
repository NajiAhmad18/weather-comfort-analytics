import { auth } from 'express-oauth2-jwt-bearer';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.config';

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  const domain = process.env.AUTH0_DOMAIN || config.auth0Domain;
  const audience = process.env.AUTH0_AUDIENCE || config.auth0Audience;

  // If Auth0 domain/audience are not configured, allow requests in pass-through mode for local dev without Auth0 tenant
  if (!domain || !audience) {
    return next();
  }

  const jwtCheck = auth({
    audience,
    issuerBaseURL: domain.startsWith('http') ? domain : `https://${domain}/`,
    tokenSigningAlg: 'RS256',
  });

  return jwtCheck(req, res, next);
};
