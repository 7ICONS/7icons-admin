import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AccountSettings from "@/components/settings/AccountSettings";
import {
  getRoleDescription,
  getRoleLabel,
  hasPermission,
  isAdminRole,
} from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
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

  if (
    adminRoleError ||
    !adminRole ||
    !adminRole.is_active ||
    !isAdminRole(adminRole.role)
  ) {
    redirect("/unauthorized");
  }

  if (
    !hasPermission(
      adminRole.role,
      "settings.view",
    )
  ) {
    redirect("/unauthorized");
  }

  if (userProfileError) {
    console.error(
      "Unable to load settings profile:",
      userProfileError,
    );
  }

  const email =
    userProfile?.email?.trim() ||
    "";

  const displayName =
    userProfile?.display_name?.trim() ||
    email.split("@")[0] ||
    "7ICONS User";

  const avatarUrl =
    userProfile?.avatar_url?.trim() ||
    "";

  const roleLabel =
    getRoleLabel(
      adminRole.role,
    );

  const roleDescription =
    getRoleDescription(
      adminRole.role,
    );

  const canManagePlatform =
    hasPermission(
      adminRole.role,
      "settings.manage",
    );

  return (
    <AccountSettings
      userId={userId}
      initialDisplayName={
        displayName
      }
      email={email}
      initialAvatarUrl={
        avatarUrl
      }
      role={adminRole.role}
      roleLabel={roleLabel}
      roleDescription={
        roleDescription
      }
      canManagePlatform={
        canManagePlatform
      }
    />
  );
}