import type { Metadata } from "next";
import AdminPlaceholder from "@/components/ui/AdminPlaceholder";

export const metadata: Metadata = {
  title: "Media",
};

export default function MediaPage() {
  return (
    <AdminPlaceholder
      eyebrow="Media Management"
      title="Media Library"
      description="Manage article covers, member portraits, representative photos, and other visual assets used throughout the platform."
    />
  );
}