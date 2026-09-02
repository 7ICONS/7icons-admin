import type { Metadata } from "next";
import AdminPlaceholder from "@/components/ui/AdminPlaceholder";

export const metadata: Metadata = {
  title: "Schedule",
};

export default function SchedulePage() {
  return (
    <AdminPlaceholder
      eyebrow="Schedule Management"
      title="Schedule"
      description="Manage upcoming activities, performances, fan meetings, livestreams, television appearances, and other events."
    />
  );
}