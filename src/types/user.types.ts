export enum UserType {
  STUDENT = 'student',
  ADVISOR = 'advisor',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  type: UserType;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  type: UserType;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  type?: UserType;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  type: UserType;
  created_at: Date;
  updated_at: Date;
}
