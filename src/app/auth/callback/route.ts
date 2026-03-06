import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles the OAuth/email confirmation/password-reset callback from Supabase.
 *
 * Supports two exchange mechanisms:
 *  - PKCE flow: `code` query param → exchangeCodeForSession
 *  - Implicit/recovery flow: `token_hash` + `type` query params → verifyOtp
 *
 * After a successful exchange the user is redirected to the `next` param
 * (defaults to /dashboard).  On failure they are sent to /login with an
 * error indicator.
 *
 * @param request - The incoming GET request from Supabase's redirect.
 * @returns A redirect response to the next page or the login error page.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as
    | "recovery"
    | "signup"
    | "magiclink"
    | "email"
    | null;
  const next = searchParams.get("next") ?? "/dashboard";

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
