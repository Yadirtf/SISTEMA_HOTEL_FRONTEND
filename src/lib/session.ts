"use client";

import { JwtResponseDto } from "./api";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function saveSession(jwt: JwtResponseDto) {
  localStorage.setItem(TOKEN_KEY, jwt.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(jwt.user));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}


