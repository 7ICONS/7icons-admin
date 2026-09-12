import { redirect } from "next/navigation";

import AdminRouteGuard from "@/components/layout/AdminRouteGuard";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminTopbar from "@/components/layout/AdminTopbar";

import {
  getRoleLabel,
  isAdminRole,
} from "@/lib/permissions";

import { createClient } from "@/lib/supabase/server";

type RoleDirectoryItem = {
  user_id: string;
  role: string;
  is_active: boolean;
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase =
    await createClient();

  /*
   * =========================================================
   * VERIFIED SESSION
   * =========================================================
   */
  const {
    data: claimsData,
    error: claimsError,
  } =
    await supabase.auth.getClaims();

  const userId =
    claimsData?.claims?.sub;

  if (
    claimsError ||
    !userId
  ) {
    redirect("/login");
  }

  /*
   * =========================================================
   * ROLE + PROFILE
   * =========================================================
   *
   * Role tidak lagi dibaca langsung dari admin_roles.
   *
   * Kita menggunakan secure RPC yang sama dengan
   * proxy dan User Management.
   */
  const [
    roleDirectoryResult,
    userProfileResult,
  ] = await Promise.all([
    supabase.rpc(
      "get_user_role_directory",
    ),

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

  /*
   * =========================================================
   * ROLE VALIDATION
   * =========================================================
   */
  if (
    roleDirectoryResult.error
  ) {
    console.error(
      "Unable to load admin role directory:",
      roleDirectoryResult.error,
    );

    redirect("/unauthorized");
  }

  const roleDirectory =
    Array.isArray(
      roleDirectoryResult.data,
    )
      ? (roleDirectoryResult.data as RoleDirectoryItem[])
      : [];

  const currentRole =
    roleDirectory.find(
      (item) =>
        item.user_id ===
          userId &&
        item.is_active,
    );

  if (
    !currentRole ||
    !isAdminRole(
      currentRole.role,
    )
  ) {
    redirect("/unauthorized");
  }

  const adminRole =
    currentRole.role;

  /*
   * =========================================================
   * PROFILE
   * =========================================================
   */
  if (
    userProfileResult.error
  ) {
    console.error(
      "Unable to load admin profile:",
      userProfileResult.error,
    );
  }

  const userProfile =
    userProfileResult.data;

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
      adminRole,
    );

  /*
   * =========================================================
   * ADMIN SHELL
   * =========================================================
   */
  return (
    <div className="flex min-h-screen bg-[#f8f7ff]">
      <AdminSidebar
        displayName={
          displayName
        }
        avatarUrl={
          avatarUrl
        }
        role={
          adminRole
        }
        roleLabel={
          roleLabel
        }
      />

      <div className="min-w-0 flex flex-1 flex-col">
        <AdminTopbar
          userId={
            userId
          }
          displayName={
            displayName
          }
          email={
            email
          }
          avatarUrl={
            avatarUrl
          }
          role={
            adminRole
          }
          roleLabel={
            roleLabel
          }
        />

        <main className="flex-1 p-5 sm:p-6 lg:p-8">
          <AdminRouteGuard
            role={
              adminRole
            }
          >
            {children}
          </AdminRouteGuard>
        </main>
      </div>
    </div>
  );
}