import type { Metadata } from "next";
import AdminPlaceholder from "@/components/ui/AdminPlaceholder";

export const metadata: Metadata = {
  title: "Comments",
};

export default function CommentsPage() {
  return (
    <AdminPlaceholder
      eyebrow="Community Moderation"
      title="Comments"
      description="Review, moderate, approve, hide, and manage community comments from the public 7ICONS website."
    />
  );
}