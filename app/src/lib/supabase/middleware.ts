import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { locales } from "@/i18n/routing";

const localePattern = locales.join("|");

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.startsWith("your-")) {
    // No Supabase configured — skip auth, allow all routes
    return supabaseResponse;
  }

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — important for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes — redirect to login if not authenticated
  const localeMatch = request.nextUrl.pathname.match(new RegExp(`^/(${localePattern})`));
  const locale = localeMatch ? localeMatch[1] : "en";

  const isAuthRoute = request.nextUrl.pathname.match(
    new RegExp(`^/(${localePattern})/(login|register|verify|plans)`)
  );
  const isLegalRoute = request.nextUrl.pathname.match(
    new RegExp(`^/(${localePattern})/legal/`)
  );
  const isPublicStaticRoute = request.nextUrl.pathname.match(
    new RegExp(`^/(${localePattern})/(about|support)$`)
  );
  const isPublicRoute =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.match(new RegExp(`^/(${localePattern})$`)) ||
    isAuthRoute ||
    isLegalRoute ||
    isPublicStaticRoute;

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/onboarding`;
    return NextResponse.redirect(url);
  }

  // Gate: require onboarding completion before accessing app routes
  const isOnboardingRoute = request.nextUrl.pathname.match(
    new RegExp(`^/(${localePattern})/onboarding`)
  );
  const isAdminRoute = request.nextUrl.pathname.match(
    new RegExp(`^/(${localePattern})/admin`)
  );
  const isAppRoute = user && !isPublicRoute && !isOnboardingRoute;

  if (isAppRoute) {
    // Check if user completed mandatory onboarding (active_funnel_level >= 3)
    const { data: profile } = await supabase
      .from("profiles")
      .select("active_funnel_level, role, is_test_user, test_expires_at")
      .eq("id", user.id)
      .single();

    // Block expired test accounts
    if (
      profile?.is_test_user &&
      profile.test_expires_at &&
      new Date(profile.test_expires_at) < new Date()
    ) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      url.searchParams.set("error", "test_expired");
      return NextResponse.redirect(url);
    }

    const funnelLevel = profile?.active_funnel_level ?? 0;
    if (funnelLevel < 3) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/onboarding`;
      return NextResponse.redirect(url);
    }

    // Admin route protection — only users with role 'admin' can access
    if (isAdminRoute && profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/profile`;
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
