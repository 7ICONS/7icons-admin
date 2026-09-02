import type { Metadata } from "next";
import AdminPlaceholder from "@/components/ui/AdminPlaceholder";

export const metadata: Metadata = {
  title: "Members",
};

export default function MembersPage() {
  return (
    <AdminPlaceholder
      eyebrow="Member Management"
      title="Members"
      description="Manage current and former 7ICONS member profiles, portraits, stories, and profile information."
    />
  );
}