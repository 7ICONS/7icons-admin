export type AdminRole =
  | "super_admin"
  | "admin"
  | "editor"
  | "moderator"
  | "representative";

export type AdminPermission =
  | "dashboard.view"
  | "articles.view"
  | "articles.create"
  | "articles.manage_all"
  | "articles.manage_own"
  | "members.manage"
  | "gallery.view"
  | "gallery.create"
  | "gallery.manage_all"
  | "gallery.manage_own"
  | "schedule.manage"
  | "representatives.manage"
  | "applications.view"
  | "applications.review"
  | "users.view"
  | "users.moderate"
  | "comments.view"
  | "comments.moderate"
  | "comments.reply_own"
  | "media.view"
  | "media.manage_all"
  | "media.manage_own"
  | "team.view"
  | "team.manage"
  | "settings.view"
  | "settings.manage";

const rolePermissions: Record<
  AdminRole,
  AdminPermission[]
> = {
  super_admin: [
    "dashboard.view",

    "articles.view",
    "articles.create",
    "articles.manage_all",

    "members.manage",

    "gallery.view",
    "gallery.create",
    "gallery.manage_all",

    "schedule.manage",

    "representatives.manage",

    "applications.view",
    "applications.review",

    "users.view",
    "users.moderate",

    "comments.view",
    "comments.moderate",

    "media.view",
    "media.manage_all",

    "team.view",
    "team.manage",

    "settings.view",
    "settings.manage",
  ],

  admin: [
    "dashboard.view",

    "articles.view",
    "articles.create",
    "articles.manage_all",

    "members.manage",

    "gallery.view",
    "gallery.create",
    "gallery.manage_all",

    "schedule.manage",

    "representatives.manage",

    "applications.view",
    "applications.review",

    "users.view",
    "users.moderate",

    "comments.view",
    "comments.moderate",

    "media.view",
    "media.manage_all",

    "settings.view",
  ],

  editor: [
    "dashboard.view",

    "articles.view",
    "articles.create",
    "articles.manage_all",

    "gallery.view",
    "gallery.create",
    "gallery.manage_all",

    "media.view",
    "media.manage_all",

    "settings.view",
  ],

  moderator: [
    "dashboard.view",

    "users.view",
    "users.moderate",

    "comments.view",
    "comments.moderate",

    "settings.view",
  ],

  representative: [
    "dashboard.view",

    "articles.view",
    "articles.create",
    "articles.manage_own",

    "gallery.view",
    "gallery.create",
    "gallery.manage_own",

    "comments.view",
    "comments.reply_own",

    "media.view",
    "media.manage_own",

    "settings.view",
  ],
};

export function isAdminRole(
  value: unknown,
): value is AdminRole {
  return (
    value === "super_admin" ||
    value === "admin" ||
    value === "editor" ||
    value === "moderator" ||
    value === "representative"
  );
}

export function hasPermission(
  role: AdminRole,
  permission: AdminPermission,
) {
  return rolePermissions[
    role
  ].includes(permission);
}

export function hasAnyPermission(
  role: AdminRole,
  permissions: AdminPermission[],
) {
  return permissions.some(
    (permission) =>
      hasPermission(
        role,
        permission,
      ),
  );
}

export function getRoleLabel(
  role: AdminRole,
) {
  switch (role) {
    case "super_admin":
      return "Super Admin";

    case "admin":
      return "Admin";

    case "editor":
      return "Editor";

    case "moderator":
      return "Moderator";

    case "representative":
      return "ICONIA Representative";
  }
}

export function getRoleDescription(
  role: AdminRole,
) {
  switch (role) {
    case "super_admin":
      return "Full platform access including staff, roles, settings, content, users, applications, and moderation.";

    case "admin":
      return "General platform administration covering content, members, schedule, representatives, applications, users, comments, and media.";

    case "editor":
      return "Editorial role focused on articles, gallery content, review workflows, and shared media.";

    case "moderator":
      return "Community moderation focused exclusively on registered users and comments.";

    case "representative":
      return "Regional ICONIA contributor with access to their own articles, galleries, media, and comment replies.";
  }
}