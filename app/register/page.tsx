'use client';

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  id: string;
  full_name: string;
  rank_title: string;
  department: string;
  is_active: boolean;
  role: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function toggleActiveStatus(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (!error) {
      fetchUsers();
    } else {
      alert("حدث خطأ أثناء التحديث: " + error.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم نهائياً؟")) return;
    
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (!error) {
      fetchUsers();
    } else {
      alert("حدث خطأ أثناء الحذف: " + error.message);
    }
  }

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h2>إدارة منسوبي النظام والطلبات المعلقة</h2>
        <p style={{ color: "#888", fontSize: "14px" }}>قم بقبول العسكريين الجدد، تفعيل حساباتهم، أو إيقاف الصلاحيات عند الحاجة.</p>
      </div>

      {loading ? (
        <p>جاري تحميل قائمة المستخدمين...</p>
      ) : users.length === 0 ? (
        <div style={{ padding: "20px", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }}>
          لا توجد سجلات مستخدمين حالياً.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {users.map((user) => (
            <div 
              key={user.id} 
              style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                padding: "16px", 
                background: "rgba(255,255,255,0.05)", 
                borderRadius: "8px", 
                border: "1px solid rgba(255,255,255,0.1)" 
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h4 style={{ margin: 0, fontSize: "16px" }}>{user.full_name || "بدون اسم"}</h4>
                  <span style={{ 
                    fontSize: "12px", 
                    padding: "2px 8px", 
                    borderRadius: "4px", 
                    background: user.is_active ? "rgba(46, 204, 113, 0.2)" : "rgba(231, 76, 60, 0.2)",
                    color: user.is_active ? "#2ecc71" : "#e74c3c" 
                  }}>
                    {user.is_active ? "نشط ومصرح" : "بانتظار التفعيل (معلق)"}
                  </span>
                </div>
                <p style={{ margin: "4px 0 0", color: "#aaa", fontSize: "13px" }}>
                  الرتبة: {user.rank_title || "غير محدد"} · القسم: {user.department || "المرور"} · الدور: {user.role || "user"}
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button 
                  onClick={() => toggleActiveStatus(user.id, user.is_active)}
                  style={{ 
                    background: user.is_active ? "#f39c12" : "#2ecc71", 
                    color: "#fff", 
                    border: "none", 
                    padding: "8px 16px", 
                    borderRadius: "6px", 
                    cursor: "pointer",
                    fontSize: "13px"
                  }}
                >
                  {user.is_active ? "إلغاء التفعيل" : "قبول وتفعيل"}
                </button>
                <button 
                  onClick={() => handleDelete(user.id)}
                  style={{ 
                    background: "#e74c3c", 
                    color: "#fff", 
                    border: "none", 
                    padding: "8px 16px", 
                    borderRadius: "6px", 
                    cursor: "pointer",
                    fontSize: "13px"
                  }}
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}