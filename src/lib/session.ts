"use client";

import { JwtResponseDto } from "./api";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function saveSession(jwt: JwtResponseDto) {
  localStorage.setItem(TOKEN_KEY, jwt.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(jwt.user));
  // Set cookie for middleware (not httpOnly but allows edge auth redirect)
  const maxAge = 60 * 60 * 24; // 1 day
  document.cookie = `auth_token=${jwt.access_token}; path=/; max-age=${maxAge}`;
  document.cookie = `auth_role=${encodeURIComponent(jwt.user.rol)}; path=/; max-age=${maxAge}`;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `auth_token=; path=/; max-age=0`;
  document.cookie = `auth_role=; path=/; max-age=0`;
}

export type SessionUser = {
  idUsuario: number;
  correo: string;
  rol: string;
};

export function getSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}


