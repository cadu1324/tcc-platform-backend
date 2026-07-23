import { UserType } from './user.types';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        user_type: UserType;
      };
    }
  }
}

export {};
