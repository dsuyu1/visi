import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Academy is hosted directly under `/academy` in this app (no separate domain).
  // Keep this middleware as a no-op so it doesn't rewrite or redirect requests.
  void request;
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next).*)"],
};
