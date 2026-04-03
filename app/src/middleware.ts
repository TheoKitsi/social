import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // First: handle i18n routing (locale detection, redirects)
  const intlResponse = intlMiddleware(request);

  // Then: handle Supabase auth session refresh
  const supabaseResponse = await updateSession(request);

  // Merge cookies from supabase into intl response
  if (intlResponse) {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      intlResponse.cookies.set(cookie.name, cookie.value);
    });
    return intlResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Match all pathnames except static files and API routes
    "/((?!_next|api|icons|manifest\\.json|favicon\\.ico|sw\\.js).*)",
  ],
};
