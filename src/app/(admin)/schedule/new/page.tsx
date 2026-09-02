import type { Metadata } from "next";
import AdminPlaceholder from "@/components/ui/AdminPlaceholder";

export const metadata: Metadata = {
  title: "Add Schedule",
};

export default function AddSchedulePage() {
  return (
    <AdminPlaceholder
      eyebrow="Schedule Management"
      title="Create New Event"
      description="The event creation form and schedule management tools will be added in a future development phase."
    />
  );
}