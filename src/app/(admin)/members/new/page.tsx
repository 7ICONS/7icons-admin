import type { Metadata } from "next";
import AdminPlaceholder from "@/components/ui/AdminPlaceholder";

export const metadata: Metadata = {
  title: "Add Member",
};

export default function AddMemberPage() {
  return (
    <AdminPlaceholder
      eyebrow="Member Management"
      title="Add New Member"
      description="The member creation form will be implemented during the member management development phase."
    />
  );
}