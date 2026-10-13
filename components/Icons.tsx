"use client";
import {
  LayoutDashboard, ClipboardList, Inbox, Users, Medal, CarFront, Megaphone,
  UserCog, LogOut, ShieldCheck, Bell, Search, Plus, ArrowUpLeft, FileText,
  Clock3, CircleCheck, AlertTriangle, ChevronLeft, Activity, CalendarDays,
  Settings, Eye, Check, X, Menu, UserRound, LockKeyhole, Database
} from "lucide-react";

const icons: Record<string, any> = {
  LayoutDashboard, ClipboardList, Inbox, Users, Medal, CarFront, Megaphone,
  UserCog, LogOut, ShieldCheck, Bell, Search, Plus, ArrowUpLeft, FileText,
  Clock3, CircleCheck, AlertTriangle, ChevronLeft, Activity, CalendarDays,
  Settings, Eye, Check, X, Menu, UserRound, LockKeyhole, Database
};
export default function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const Component = icons[name] || ShieldCheck;
  return <Component size={size} strokeWidth={1.8} aria-hidden="true" />;
}
