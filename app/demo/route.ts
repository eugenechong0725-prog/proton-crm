import { NextResponse } from "next/server";
import { DEMO_COOKIE } from "@/lib/demo/session";
import { resetDemoStore } from "@/lib/demo/store";

export async function GET(request: Request) {
  const demoSessionId = crypto.randomUUID();
  resetDemoStore(demoSessionId);
  const redirectUrl = new URL(request.url);
  redirectUrl.pathname = "/dashboard";
  redirectUrl.search = "";
  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set(DEMO_COOKIE, demoSessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}
