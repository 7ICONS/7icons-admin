"use client";

import {
  usePathname,
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useMemo,
} from "react";

import {
  hasPermission,
  type AdminPermission,
  type AdminRole,
} from "@/lib/permissions";

type AdminRouteGuardProps = {
  children: React.ReactNode;
  role: AdminRole;
};

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
    permission:
      "representatives.manage",
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

function getRequiredPermission(
  pathname: string,
) {
  const route =
    protectedRoutes.find(
      (item) =>
        pathname === item.path ||
        pathname.startsWith(
          `${item.path}/`,
        ),
    );

  return route?.permission ?? null;
}

export default function AdminRouteGuard({
  children,
  role,
}: AdminRouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  const requiredPermission =
    useMemo(
      () =>
        getRequiredPermission(
          pathname,
        ),
      [pathname],
    );

  const canAccess =
    requiredPermission === null ||
    hasPermission(
      role,
      requiredPermission,
    );

  useEffect(() => {
    if (canAccess) {
      return;
    }

    router.replace(
      "/unauthorized",
    );

    router.refresh();
  }, [
    canAccess,
    router,
  ]);

  if (!canAccess) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Checking access...
          </p>
        </div>
      </div>
    );
  }

  return children;
}