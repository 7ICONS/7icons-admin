import type { Metadata } from "next";
import AdminPlaceholder from "@/components/ui/AdminPlaceholder";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <AdminPlaceholder
      eyebrow="Administration"
      title="Settings"
      description="Platform configuration, administrator preferences, permissions, and system settings will eventually be managed here."
    />
  );
}