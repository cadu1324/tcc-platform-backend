export interface PasswordResetToken {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  password: string;
}
