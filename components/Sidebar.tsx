"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, ROLE_LABELS, Role } from "@/lib/types";
import Icon from "@/components/Icons";

export default function Sidebar({ role }: { role: Role }) {
  const path = usePathname();
  const items = NAV_ITEMS.filter((item: any) => !item.roles || item.roles.includes(role));
  return <aside className="sidebar">
    <div className="brand">
      <div className="brand-mark">HP1</div>
      <div><div className="brand-title">TRAFFIC COMMAND</div><div className="brand-sub">نظام القيادة المرورية</div></div>
    </div>
    <div>
      <div className="nav-label">القائمة الرئيسية</div>
      <nav className="nav">{items.map(item => <Link key={item.href} href={item.href} className={path === item.href ? "active" : ""}>
        <Icon name={item.icon}/><span>{item.label}</span>
      </Link>)}</nav>
    </div>
    <div className="sidebar-foot"><div>HP1 TRAFFIC DEPARTMENT</div><div>نظام داخلي — للاستخدام المصرح فقط</div><div style={{color:"#d7b46a",marginTop:8}}>الإصدار 1.0.0</div></div>
  </aside>;
}
