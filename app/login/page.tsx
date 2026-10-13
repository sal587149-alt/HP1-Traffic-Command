'use client';

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const search = useSearchParams();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const supabase = createClient();
    
    // تسجيل الدخول المباشر عبر Supabase Auth
    const { error } = await supabase.auth.signInWithPassword({ 
      email: email.trim(), 
      password 
    });
    
    if (error) {
      console.error("Supabase Login Error:", error.message);
      setError("تعذر تسجيل الدخول. تأكد من البريد وكلمة المرور."); 
      setBusy(false); 
      return; 
    }
    
    // التوجيه المباشر للوحة التحكم متخطياً أي قيود إضافية
    router.push("/dashboard"); 
    router.refresh();
  }

  return (
    <div className="login-wrap">
      <section className="login-art">
        <div className="crest">HP1</div>
        <h1>TRAFFIC COMMAND</h1>
        <p>نظام القيادة والإدارة المرورية<br />منصة داخلية موحدة لمنسوبي المرور العسكري</p>
      </section>
      <section className="login-panel">
        <div className="login-box">
          <div className="brand" style={{padding:"0 0 20px",marginBottom:22}}>
            <div className="brand-mark">HP1</div>
            <div className="brand-title">مرحبًا بعودتك</div>
            <div className="brand-sub">سجل الدخول إلى حسابك العسكري</div>
          </div>
          {error && <div className="error">{error}</div>}
          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="email">البريد الإلكتروني</label>
              <input id="email" className="input" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com" />
            </div>
            <div className="field">
              <label htmlFor="password">كلمة المرور</label>
              <input id="password" className="input" type="password" autoComplete="current-password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} />
            </div>
            <button className="btn gold" disabled={busy}>{busy ? "...جاري التحقق" : "دخول آمن ↗"}</button>
          </form>
          <div className="footer-note">لا يوجد تسجيل عام. الحسابات تُنشأ من قبل مسؤول مخول. لا تشارك بيانات الدخول مع أي شخص.</div>
        </div>
      </section>
    </div>
  );
}