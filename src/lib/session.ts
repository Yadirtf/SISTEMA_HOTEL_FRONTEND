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
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `auth_token=; path=/; max-age=0`;
}


