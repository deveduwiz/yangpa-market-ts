import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      email?: string;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  email: string;
}
