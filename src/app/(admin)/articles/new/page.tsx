import type { Metadata } from "next";
import AdminPlaceholder from "@/components/ui/AdminPlaceholder";

export const metadata: Metadata = {
  title: "New Article",
};

export default function NewArticlePage() {
  return (
    <AdminPlaceholder
      eyebrow="Article Management"
      title="Create New Article"
      description="The article editor and publishing workflow will be developed in the upcoming content management phase."
    />
  );
}