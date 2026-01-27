import { UserType } from './user.types';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        type: UserType;
      };
    }
  }
}

export {};
