import api from "./axios";
import type { IUser } from "../types";

interface AuthResponse {
  user: IUser;
  accessToken: string;
}

export const registerApi = (name: string, email: string, password: string) =>
  api.post<{ data: AuthResponse }>("/auth/register", { name, email, password });

export const loginApi = (email: string, password: string) =>
  api.post<{ data: AuthResponse }>("/auth/login", { email, password });

export const logoutApi = () => api.post("/auth/logout");

export const refreshTokenApi = () =>
  api.post<{ data: { accessToken: string } }>("/auth/refresh-token");

export const getMeApi = () => api.get<{ data: { user: IUser } }>("/auth/me");
