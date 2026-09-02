import type { Metadata } from "next";
import AdminLogin from "@/components/auth/AdminLogin";

export const metadata: Metadata = {
  title: "Admin Login",
};

export default function LoginPage() {
  return <AdminLogin />;
}