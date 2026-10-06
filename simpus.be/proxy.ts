import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin");
  const isAllowedOrigin = origin ? allowedOrigins.includes(origin) : false;

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
