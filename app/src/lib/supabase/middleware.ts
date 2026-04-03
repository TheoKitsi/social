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
  const isPublicRoute =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.match(new RegExp(`^/(${localePattern})$`)) ||
    isAuthRoute ||
    isLegalRoute;

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

  return supabaseResponse;
}
