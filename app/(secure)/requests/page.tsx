import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
export default async function RequestsPage(){
 const s=createClient();const {data:{user}}=await s.auth.getUser();const {data:p}=await s.from("profiles").select("role").eq("id",user!.id).single();
 const manager=["officer","section_head","deputy_director","director","brigadier","system_admin"].includes(p?.role);
 let q=s.from("military_requests").select("id,request_type,title,status,created_at,profiles:submitted_by(full_name)").order("created_at",{ascending:false}).limit(100);if(!manager)q=q.eq("submitted_by",user!.id);const {data:rows,error}=await q;
 const labels:Record<string,string>={pending:"بانتظار المراجعة",approved:"مقبول",rejected:"مرفوض",completed:"مكتمل"};
 return <><div className="page-head"><div><h1>الطلبات العسكرية</h1><p>متابعة طلبات الإجازة والنقل والاعتراضات وغيرها.</p></div><Link className="btn gold" href="/requests/new">＋ طلب جديد</Link></div><div className="table-wrap"><table className="table"><thead><tr><th>عنوان الطلب</th><th>النوع</th>{manager&&<th>مقدم الطلب</th>}<th>التاريخ</th><th>الحالة</th></tr></thead><tbody>{rows?.map((r:any)=><tr key={r.id}><td>{r.title}</td><td>{r.request_type}</td>{manager&&<td>{r.profiles?.full_name||"—"}</td>}<td>{new Date(r.created_at).toLocaleDateString("ar-SA")}</td><td><span className={`pill ${r.status==="approved"||r.status==="completed"?"green":r.status==="rejected"?"red":"gold"}`}>{labels[r.status]||r.status}</span></td></tr>)}{!rows?.length&&<tr><td colSpan={manager?5:4} className="empty">لا توجد طلبات.</td></tr>}</tbody></table></div>{error&&<div className="error">تعذر تحميل الطلبات. راجع إعداد قاعدة البيانات.</div>}</>;
}
