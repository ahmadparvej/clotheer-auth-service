import { Request } from "express";

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
  tenantId?: number;
}

export interface RegisterUserRequest extends Request {
  body: UserData;
}

export interface CreateUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
  tenantId: number;
}

export interface CreateUserRequest extends Request {
  body: CreateUser;
}

export interface AuthRequest extends Request {
  auth: {
    sub: number;
    role: string;
    id?: number;
  };
}

export interface TenantRequest extends Request {
  body: ITenant;
}

export type AuthCookie = { access_token: string; refresh_token: string };

export interface IRefreshToken {
  id: number;
}

export interface ITenant {
  name: string;
  address: string;
  id?: number;
}

export interface UserQueryParams {
  page: number;
  limit: number;
}
