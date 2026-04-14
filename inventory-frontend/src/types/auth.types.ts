export type Role = 'ADMIN' | 'MANAGER' | 'CASHIER';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  email: string;
  role: Role;
  expires_in: number;
}
