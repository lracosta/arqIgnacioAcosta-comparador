import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Define protected routes
    const isAuthRoute = request.nextUrl.pathname.startsWith("/(auth)") ||
        request.nextUrl.pathname === "/login" ||
        request.nextUrl.pathname === "/registro" ||
        request.nextUrl.pathname === "/recuperar";

    const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
    const isClienteRoute = request.nextUrl.pathname.startsWith("/cliente");
    const isProtectedRoute = isAdminRoute || isClienteRoute;

    // Redirect logic
    if (!user && isProtectedRoute) {
        // Not authenticated and trying to access protected route
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    if (user && isAuthRoute) {
        // Authenticated and trying to access auth pages
        // Redirect to appropriate dashboard based on role
        // For now, redirect to admin dashboard (we'll improve this after DB setup)
        const url = request.nextUrl.clone();
        url.pathname = "/admin/dashboard";
        return NextResponse.redirect(url);
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is.
    return supabaseResponse;
}
