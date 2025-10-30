import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas protegidas
const protectedPaths = [
  "/panel",
  "/reservas",
  "/huespedes",
  "/habitaciones",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/panel", "/reservas", "/huespedes", "/habitaciones"],
};


