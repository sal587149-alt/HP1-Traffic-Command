import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABELS, Role } from "@/lib/types";
export default async function ReportsPage() {
  const supabase=createClient(); const {data:{user}}=await supabase.auth.getUser();
  const {data:profile}=await supabase.from("profiles").select("role,department").eq("id",user!.id).single();
  const manager=["supervisor","officer","section_head","deputy_director","director","brigadier","system_admin"].includes(profile?.role);
  let query=supabase.from("reports").select("id,title,report_type,status,created_at,department,profiles:submitted_by(full_name)").order("created_at",{ascending:false}).limit(100);
  if(!manager) query=query.eq("submitted_by",user!.id);
  const {data:rows,error}=await query;
  const labels:Record<string,string>={pending:"قيد المراجعة",approved:"مقبول",rejected:"مرفوض"};
  return <><div className="page-head"><div><h1>التقارير اليومية</h1><p>ارفع تقاريرك وتابع حالتها. تظهر تقارير الآخرين للمخولين فقط.</p></div><Link href="/reports/new" className="btn gold">＋ رفع تقرير</Link></div>
    <div className="toolbar"><span className="pill">عدد السجلات: {rows?.length||0}</span><span className="pill">القسم: {profile?.department||"المرور"}</span></div>
    <div className="table-wrap"><table className="table"><thead><tr><th>عنوان التقرير</th><th>النوع</th>{manager&&<th>مقدم التقرير</th>}<th>التاريخ</th><th>الحالة</th><th>الإجراء</th></tr></thead><tbody>
    {rows?.map((r:any)=><tr key={r.id}><td>{r.title}</td><td>{r.report_type}</td>{manager&&<td>{r.profiles?.full_name||"—"}</td>}<td>{new Date(r.created_at).toLocaleDateString("ar-SA")}</td><td><span className={`pill ${r.status==="approved"?"green":r.status==="rejected"?"red":"gold"}`}>{labels[r.status]||r.status}</span></td><td><Link className="btn" href={`/reports/${r.id}`}>التفاصيل</Link></td></tr>)}
    {!rows?.length&&<tr><td colSpan={manager?6:5} className="empty">لا توجد تقارير مسجلة.</td></tr>}
    </tbody></table></div>{error&&<div className="error">تعذر تحميل البيانات. تأكد من إعداد قاعدة البيانات وسياسات الوصول.</div>}</>;
}
