import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Landing route for Supabase password-reset emails (PKCE code exchange). */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const origin = request.nextUrl.origin;
  if (!code) return NextResponse.redirect(`${origin}/admin/login?error=link`);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/admin/login?error=link`);

  const response = NextResponse.redirect(`${origin}/admin/account?reset=1`);
  response.cookies.set("pw_reset", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 15 * 60,
  });
  return response;
}
