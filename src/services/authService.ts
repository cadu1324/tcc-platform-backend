import { CreateUserDTO, UserResponse } from '../types/user.types';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

export const authService = {
  async register(data: CreateUserDTO): Promise<AuthResponse> {
    // TODO: Implementar
    return {} as AuthResponse;
  },

  async login(data: LoginDTO): Promise<AuthResponse> {
    // TODO: Implementar
    return {} as AuthResponse;
  }
};
