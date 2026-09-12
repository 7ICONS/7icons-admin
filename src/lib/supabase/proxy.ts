import { createServerClient } from "@supabase/ssr";
import {
  NextResponse,
  type NextRequest,
} from "next/server";

import {
  hasPermission,
  isAdminRole,
  type AdminPermission,
  type AdminRole,
} from "@/lib/permissions";

type ProtectedRoute = {
  path: string;
  permission: AdminPermission;
};

type RoleDirectoryItem = {
  user_id: string;
  role: string;
  is_active: boolean;
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

/*
 * Copy cookie hasil Supabase session refresh
 * ke response baru seperti redirect.
 *
 * Tanpa ini, refresh session dapat berhasil
 * di server tetapi cookie barunya tidak sampai
 * ke browser ketika request berakhir dengan
 * redirect.
 */
function copySessionCookies(
  source: NextResponse,
  target: NextResponse,
) {
  source.cookies
    .getAll()
    .forEach((cookie) => {
      target.cookies.set(cookie);
    });

  return target;
}

export async function updateSession(
  request: NextRequest,
) {
  let supabaseResponse =
    NextResponse.next({
      request,
    });

  const supabaseUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env
      .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env
      .NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseKey
  ) {
    throw new Error(
      "Missing Supabase environment variables.",
    );
  }

  const supabase =
    createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },

          setAll(cookiesToSet) {
            /*
             * Update request cookies so every
             * Supabase query in this same request
             * immediately sees the refreshed
             * session.
             */
            cookiesToSet.forEach(
              ({
                name,
                value,
              }) => {
                request.cookies.set(
                  name,
                  value,
                );
              },
            );

            /*
             * Recreate the pass-through response
             * using the updated request.
             */
            supabaseResponse =
              NextResponse.next({
                request,
              });

            /*
             * Send refreshed cookies back
             * to the browser.
             */
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

  /*
   * =========================================================
   * VERIFIED SESSION
   * =========================================================
   */
  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const userId =
    claimsData?.claims?.sub;

  const isAuthenticated =
    Boolean(userId) &&
    !claimsError;

  const pathname =
    request.nextUrl.pathname;

  const protectedRoute =
    getProtectedRoute(pathname);

  /*
   * =========================================================
   * ROLE RESOLVER
   * =========================================================
   *
   * Jangan query admin_roles langsung.
   *
   * Gunakan secure RPC yang sudah dipakai
   * oleh User Management.
   */
  let cachedRole:
    | AdminRole
    | null
    | undefined;

  async function resolveAdminRole() {
    if (
      cachedRole !==
      undefined
    ) {
      return cachedRole;
    }

    if (!userId) {
      cachedRole = null;
      return cachedRole;
    }

    const {
      data,
      error,
    } = await supabase.rpc(
      "get_user_role_directory",
    );

    if (error) {
      console.error(
        "Unable to resolve admin role:",
        error,
      );

      cachedRole = null;

      return cachedRole;
    }

    const roles =
      Array.isArray(data)
        ? (data as RoleDirectoryItem[])
        : [];

    const currentRole =
      roles.find(
        (item) =>
          item.user_id === userId &&
          item.is_active,
      );

    if (
      !currentRole ||
      !isAdminRole(
        currentRole.role,
      )
    ) {
      cachedRole = null;

      return cachedRole;
    }

    cachedRole =
      currentRole.role;

    return cachedRole;
  }

  /*
   * =========================================================
   * 1. PROTECTED ROUTE REQUIRES LOGIN
   * =========================================================
   */
  if (
    !isAuthenticated &&
    protectedRoute
  ) {
    const loginUrl =
      request.nextUrl.clone();

    loginUrl.pathname = "/login";
    loginUrl.search = "";

    loginUrl.searchParams.set(
      "next",
      pathname,
    );

    const redirectResponse =
      NextResponse.redirect(
        loginUrl,
      );

    return copySessionCookies(
      supabaseResponse,
      redirectResponse,
    );
  }

  /*
   * =========================================================
   * 2. PROTECTED ROUTE ROLE + PERMISSION
   * =========================================================
   */
  if (
    isAuthenticated &&
    userId &&
    protectedRoute
  ) {
    const adminRole =
      await resolveAdminRole();

    if (!adminRole) {
      const unauthorizedUrl =
        request.nextUrl.clone();

      unauthorizedUrl.pathname =
        "/unauthorized";

      unauthorizedUrl.search = "";

      const redirectResponse =
        NextResponse.redirect(
          unauthorizedUrl,
        );

      return copySessionCookies(
        supabaseResponse,
        redirectResponse,
      );
    }

    const allowed =
      hasPermission(
        adminRole,
        protectedRoute.permission,
      );

    if (!allowed) {
      const unauthorizedUrl =
        request.nextUrl.clone();

      unauthorizedUrl.pathname =
        "/unauthorized";

      unauthorizedUrl.search = "";

      const redirectResponse =
        NextResponse.redirect(
          unauthorizedUrl,
        );

      return copySessionCookies(
        supabaseResponse,
        redirectResponse,
      );
    }
  }

  /*
   * =========================================================
   * 3. ACTIVE ADMIN DOES NOT NEED LOGIN PAGE
   * =========================================================
   */
  if (
    isAuthenticated &&
    userId &&
    pathname === "/login"
  ) {
    const adminRole =
      await resolveAdminRole();

    if (adminRole) {
      const dashboardUrl =
        request.nextUrl.clone();

      dashboardUrl.pathname =
        "/dashboard";

      dashboardUrl.search = "";

      const redirectResponse =
        NextResponse.redirect(
          dashboardUrl,
        );

      return copySessionCookies(
        supabaseResponse,
        redirectResponse,
      );
    }
  }

  return supabaseResponse;
}