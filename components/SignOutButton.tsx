"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Icon from "@/components/Icons";

export default function SignOutButton() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function signOut() {
    setBusy(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }
  return <button className="btn" title="تسجيل الخروج" aria-label="تسجيل الخروج" disabled={busy} onClick={signOut} style={{padding:9}}><Icon name="LogOut" size={16}/></button>;
}
