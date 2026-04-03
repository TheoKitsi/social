import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  // Extract locale from referer or default to en
  const referer = request.headers.get("referer") || "";
  const localeMatch = referer.match(/\/(en|de|el)\//);
  const locale = localeMatch ? localeMatch[1] : "en";
  const redirectPath = next ?? `/${locale}/onboarding`;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Update email_verified in profiles
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("profiles")
          .update({ email_verified: true })
          .eq("user_id", user.id);
      }

      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/login?error=auth`);
}
