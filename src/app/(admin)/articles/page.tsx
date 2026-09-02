import type { Metadata } from "next";
import AdminPlaceholder from "@/components/ui/AdminPlaceholder";

export const metadata: Metadata = {
  title: "Articles",
};

export default function ArticlesPage() {
  return (
    <AdminPlaceholder
      eyebrow="Content Management"
      title="Articles"
      description="Create, edit, publish, and manage articles displayed on the 7ICONS public website."
    />
  );
}