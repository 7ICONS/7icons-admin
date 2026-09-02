import type { Metadata } from "next";
import AdminPlaceholder from "@/components/ui/AdminPlaceholder";

export const metadata: Metadata = {
  title: "Users",
};

export default function UsersPage() {
  return (
    <AdminPlaceholder
      eyebrow="User Management"
      title="Users"
      description="Registered user accounts, account status, activity, and moderation tools will be managed from this module."
    />
  );
}