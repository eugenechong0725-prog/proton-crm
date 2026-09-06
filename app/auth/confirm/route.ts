import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && next === "/forgot-password") {
      return NextResponse.redirect(new URL("/forgot-password?recovery=1", request.url));
    }
  }

  return NextResponse.redirect(new URL("/login?reset_error=1", request.url));
}
