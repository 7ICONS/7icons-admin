import { redirect } from "next/navigation";

import AdminRouteGuard from "@/components/layout/AdminRouteGuard";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminTopbar from "@/components/layout/AdminTopbar";

import {
  getRoleLabel,
  isAdminRole,
} from "@/lib/permissions";

import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase =
    await createClient();

  const { data: claimsData } =
    await supabase.auth.getClaims();

  const userId =
    claimsData?.claims?.sub;

  if (!userId) {
    redirect("/login");
  }

  const [
    {
      data: adminRole,
      error: adminRoleError,
    },
    {
      data: userProfile,
      error: userProfileError,
    },
  ] = await Promise.all([
    supabase
      .from("admin_roles")
      .select(
        `
          role,
          is_active
        `,
      )
      .eq("user_id", userId)
      .maybeSingle(),

    supabase
      .from("user_profiles")
      .select(
        `
          email,
          display_name,
          avatar_url
        `,
      )
      .eq("id", userId)
      .maybeSingle(),
  ]);

  if (adminRoleError) {
    console.error(
      "Unable to load admin role:",
      adminRoleError,
    );

    redirect("/unauthorized");
  }

  if (
    !adminRole ||
    !adminRole.is_active
  ) {
    redirect("/unauthorized");
  }

  if (
    !isAdminRole(adminRole.role)
  ) {
    console.error(
      "Unknown admin role:",
      adminRole.role,
    );

    redirect("/unauthorized");
  }

  if (userProfileError) {
    console.error(
      "Unable to load admin profile:",
      userProfileError,
    );
  }

  const email =
    userProfile?.email?.trim() ||
    "";

  const displayName =
    userProfile?.display_name?.trim() ||
    email.split("@")[0] ||
    "Admin ICONIA";

  const avatarUrl =
    userProfile?.avatar_url?.trim() ||
    "";

  const roleLabel =
    getRoleLabel(
      adminRole.role,
    );

  return (
    <div className="flex min-h-screen bg-[#f8f7ff]">
      <AdminSidebar
        displayName={displayName}
        avatarUrl={avatarUrl}
        role={adminRole.role}
        roleLabel={roleLabel}
      />

      <div className="min-w-0 flex flex-1 flex-col">
        <AdminTopbar
          userId={userId}
          displayName={displayName}
          email={email}
          avatarUrl={avatarUrl}
          role={adminRole.role}
          roleLabel={roleLabel}
        />

        <main className="flex-1 p-5 sm:p-6 lg:p-8">
          <AdminRouteGuard
            role={adminRole.role}
          >
            {children}
          </AdminRouteGuard>
        </main>
      </div>
    </div>
  );
}