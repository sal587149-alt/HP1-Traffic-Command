import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import { ROLE_LABELS, Role } from "@/lib/types";
import SignOutButton from "@/components/SignOutButton";

export default async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // جلب بيانات الحساب إن وجدت
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, rank_title, department, role, is_active")
    .eq("id", user.id)
    .single();

  // تم إلغاء شرط التوجيه عند الحساب غير النشط للتأكد من دخولك المباشر للوحة التحكم
  const role = (profile?.role as Role) || "admin";

  return (
    <div className="shell">
      <Sidebar role={role} />
      <div className="main">
        <header className="topbar">
          <div>
            <div className="eyebrow">HP1 / إدارة المرور</div>
            <div className="top-title">نظام القيادة والتحكم المروري</div>
          </div>
          <div className="user-chip">
            <div className="avatar">
              {(profile?.full_name || user.email || "ع").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="user-name">{profile?.full_name || "مسؤول النظام"}</div>
              <div className="user-role">
                {profile?.rank_title || ROLE_LABELS[role] || "مسؤول"} · {profile?.department || "المرور"}
              </div>
            </div>
            <SignOutButton />
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}