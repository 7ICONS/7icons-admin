import type { Metadata } from "next";
import AdminPlaceholder from "@/components/ui/AdminPlaceholder";

export const metadata: Metadata = {
  title: "Fan Representatives",
};

export default function RepresentativesPage() {
  return (
    <AdminPlaceholder
      eyebrow="Community Management"
      title="Fan Representatives"
      description="Manage ICONIA representatives, regions, cities, contact information, portraits, and community profiles."
    />
  );
}