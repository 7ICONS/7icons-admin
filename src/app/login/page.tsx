import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AdminLogin from "@/components/auth/AdminLogin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin Login",
};

export default async function LoginPage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  if (data?.claims?.sub) {
    redirect("/dashboard");
  }

  return <AdminLogin />;
}