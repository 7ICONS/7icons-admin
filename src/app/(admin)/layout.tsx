import { redirect } from "next/navigation";

import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminTopbar from "@/components/layout/AdminTopbar";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  // 1. Pastikan user benar-benar login
  const { data: claimsData } = await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (!userId) {
    redirect("/login");
  }

  // 2. Ambil role admin milik user tersebut
  const { data: adminRole } = await supabase
    .from("admin_roles")
    .select("role, is_active")
    .eq("user_id", userId)
    .maybeSingle();

  // 3. User login tapi tidak terdaftar sebagai admin
  if (!adminRole || !adminRole.is_active) {
    redirect("/unauthorized");
  }

  return (
    <div className="flex min-h-screen bg-[#f8f7ff]">
      <AdminSidebar />

      <div className="min-w-0 flex flex-1 flex-col">
        <AdminTopbar />

        <main className="flex-1 p-5 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}