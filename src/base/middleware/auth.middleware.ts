import { Request, Response, NextFunction } from 'express';
import * as passport from 'passport';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = passport.authenticate('slave-jwt', { session: false });
  return auth(req, res, next);
}
