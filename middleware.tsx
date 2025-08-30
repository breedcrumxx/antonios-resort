import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const helperpages = [
  '/unverified',
  '/403',
  '/404',
  '/verify',
  '/blocked',
  '/reset',
  '/package',
  '/gallery',
  '/faq',
  '/coupons',
]

export async function middleware(req: NextRequest) {

  if (req.method == "GET") { // mainteace checking
    const response = await fetch(new URL(`/api/system/maintenance/active`, req.nextUrl).href, {
      method: "GET",
    });

    if (!response.ok) {
      return NextResponse.redirect(new URL("/fail", req.nextUrl));
    }

    if (response.status == 200) { // check the coverage

      const result = await response.json()
      if (result.coverage == "website" && !req.nextUrl.pathname.startsWith("/admin") && !req.nextUrl.pathname.startsWith("/admin/systemcontrol")) {
        return NextResponse.redirect(new URL("/maintenance", req.nextUrl));
      }

      if (result.coverage == "admin" && !req.nextUrl.pathname.startsWith("/admin/systemcontrol")) {
        return NextResponse.redirect(new URL("/maintenance", req.nextUrl));
      }
    }

    if (!(helperpages.some((item) => req.nextUrl.pathname.includes(item)))) {
      const session = await getToken({ req: req })
      if (!session) {
        return NextResponse.redirect(new URL("/signin", req.nextUrl));
      }

      const user = session.user as UserSession

      if (req.nextUrl.pathname.includes("/admin/systemcontrol") && !user.role.systemcontrol) {
        return NextResponse.redirect(new URL("/403", req.nextUrl));
      }

      // check page permission
      if (req.nextUrl.pathname.includes("/admin") && !req.nextUrl.pathname.includes("/admin/systemcontrol") && !user.role.businesscontrol) {
        return NextResponse.redirect(new URL("/403", req.nextUrl));
      }
    }

    const idPattern = /^\/package\/[0-9a-fA-F]+$/;

    if (idPattern.test(req.nextUrl.pathname)) {
      const session = await getToken({ req: req })
      if (!session) {
        return NextResponse.redirect(new URL("/signin", req.nextUrl));
      }
    }

  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|test|_next/static|_next/image|favicon.ico|error|fails|maintenance|about|$|signin|signup|sliders).*)',
  ],
}
