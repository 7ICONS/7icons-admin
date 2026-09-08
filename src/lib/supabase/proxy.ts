import { createServerClient } from "@supabase/ssr";
import {
  NextResponse,
  type NextRequest,
} from "next/server";

import {
  hasPermission,
  isAdminRole,
  type AdminPermission,
} from "@/lib/permissions";

type ProtectedRoute = {
  path: string;
  permission: AdminPermission;
};

const protectedRoutes: ProtectedRoute[] = [
  {
    path: "/dashboard",
    permission: "dashboard.view",
  },
  {
    path: "/articles",
    permission: "articles.view",
  },
  {
    path: "/members",
    permission: "members.manage",
  },
  {
    path: "/gallery",
    permission: "gallery.view",
  },
  {
    path: "/schedule",
    permission: "schedule.manage",
  },
  {
    path: "/representatives",
    permission: "representatives.manage",
  },
  {
    path: "/applications",
    permission: "applications.view",
  },
  {
    path: "/users",
    permission: "users.view",
  },
  {
    path: "/comments",
    permission: "comments.view",
  },
  {
    path: "/media",
    permission: "media.view",
  },
  {
    path: "/team",
    permission: "team.view",
  },
  {
    path: "/settings",
    permission: "settings.view",
  },
];

function getProtectedRoute(
  pathname: string,
) {
  return protectedRoutes.find(
    (route) =>
      pathname === route.path ||
      pathname.startsWith(
        `${route.path}/`,
      ),
  );
}

export async function updateSession(
  request: NextRequest,
) {
  let supabaseResponse =
    NextResponse.next({
      request,
    });

  const supabase =
    createServerClient(
      process.env
        .NEXT_PUBLIC_SUPABASE_URL!,
      process.env
        .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },

          setAll(cookiesToSet) {
            cookiesToSet.forEach(
              ({ name, value }) => {
                request.cookies.set(
                  name,
                  value,
                );
              },
            );

            supabaseResponse =
              NextResponse.next({
                request,
              });

            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }) => {
                supabaseResponse.cookies.set(
                  name,
                  value,
                  options,
                );
              },
            );
          },
        },
      },
    );

  const { data: claimsData } =
    await supabase.auth.getClaims();

  const userId =
    claimsData?.claims?.sub;

  const isAuthenticated =
    Boolean(userId);

  const pathname =
    request.nextUrl.pathname;

  const protectedRoute =
    getProtectedRoute(pathname);

  // =====================================================
  // 1. Route membutuhkan login
  // =====================================================

  if (
    !isAuthenticated &&
    protectedRoute
  ) {
    const loginUrl =
      request.nextUrl.clone();

    loginUrl.pathname = "/login";

    loginUrl.searchParams.set(
      "next",
      pathname,
    );

    return NextResponse.redirect(
      loginUrl,
    );
  }

  // =====================================================
  // 2. User login dan sedang membuka protected route
  // =====================================================

  if (
    isAuthenticated &&
    userId &&
    protectedRoute
  ) {
    const {
      data: adminRole,
      error: adminRoleError,
    } = await supabase
      .from("admin_roles")
      .select(
        `
          role,
          is_active
        `,
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (
      adminRoleError ||
      !adminRole ||
      !adminRole.is_active ||
      !isAdminRole(adminRole.role)
    ) {
      const unauthorizedUrl =
        request.nextUrl.clone();

      unauthorizedUrl.pathname =
        "/unauthorized";

      unauthorizedUrl.search = "";

      return NextResponse.redirect(
        unauthorizedUrl,
      );
    }

    const allowed =
      hasPermission(
        adminRole.role,
        protectedRoute.permission,
      );

    if (!allowed) {
      const unauthorizedUrl =
        request.nextUrl.clone();

      unauthorizedUrl.pathname =
        "/unauthorized";

      unauthorizedUrl.search = "";

      return NextResponse.redirect(
        unauthorizedUrl,
      );
    }
  }

  // =====================================================
  // 3. Admin aktif tidak perlu melihat login lagi
  // =====================================================

  if (
    isAuthenticated &&
    userId &&
    pathname === "/login"
  ) {
    const {
      data: adminRole,
    } = await supabase
      .from("admin_roles")
      .select(
        `
          role,
          is_active
        `,
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (
      adminRole &&
      adminRole.is_active &&
      isAdminRole(adminRole.role)
    ) {
      const dashboardUrl =
        request.nextUrl.clone();

      dashboardUrl.pathname =
        "/dashboard";

      dashboardUrl.search = "";

      return NextResponse.redirect(
        dashboardUrl,
      );
    }
  }

  return supabaseResponse;
}