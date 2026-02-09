import { UserType } from './user.types';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        user_type: UserType;
      };
    }
  }
}

export {};
