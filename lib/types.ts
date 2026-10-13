export type Role =
  | "soldier" | "supervisor" | "officer" | "section_head"
  | "deputy_director" | "director" | "brigadier" | "system_admin";

export const ROLE_LABELS: Record<Role, string> = {
  soldier: "عسكري",
  supervisor: "مشرف",
  officer: "ضابط",
  section_head: "رئيس قسم",
  deputy_director: "نائب مدير المرور",
  director: "مدير المرور",
  brigadier: "العميد",
  system_admin: "مسؤول النظام"
};

export const NAV_ITEMS = [
  { href: "/dashboard", label: "لوحة القيادة", icon: "LayoutDashboard" },
  { href: "/reports", label: "التقارير اليومية", icon: "ClipboardList" },
  { href: "/requests", label: "الطلبات العسكرية", icon: "Inbox" },
  { href: "/personnel", label: "دليل المنسوبين", icon: "Users" },
  { href: "/promotions", label: "الترقيات", icon: "Medal" },
  { href: "/operations", label: "العمليات والدوريات", icon: "CarFront" },
  { href: "/announcements", label: "التعاميم واللوائح", icon: "Megaphone" },
  { href: "/admin/users", label: "إدارة الحسابات", icon: "UserCog", roles: ["director", "brigadier", "system_admin"] as Role[] }
];

export function canManage(role: Role) {
  return ["officer", "section_head", "deputy_director", "director", "brigadier", "system_admin"].includes(role);
}
