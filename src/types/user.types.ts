export enum UserType {
  STUDENT = 'student',
  ADVISOR = 'advisor',
  ADMIN = 'admin'
}

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  user_type: UserType;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  user_type: UserType;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  user_type?: UserType;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  user_type: UserType;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
