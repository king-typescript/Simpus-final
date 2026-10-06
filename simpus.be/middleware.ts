import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const frontendEnv = process.env.FRONTEND_URL;
const normalizedFrontend = frontendEnv
  ? frontendEnv.startsWith("http://") || frontendEnv.startsWith("https://")
    ? frontendEnv
    : `https://${frontendEnv}`
  : null;

const allowedOrigins = new Set(
  [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://simpus.satak.biz.id",
    normalizedFrontend,
  ].filter(Boolean) as string[]
);

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const isAllowedOrigin = origin ? allowedOrigins.has(origin) : false;

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    if (isAllowedOrigin && origin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
    response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
    );
    response.headers.set("Access-Control-Max-Age", "86400");
    return response;
  }

  const response = NextResponse.next();

  if (isAllowedOrigin && origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
