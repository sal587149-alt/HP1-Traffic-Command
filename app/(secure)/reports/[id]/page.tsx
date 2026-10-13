import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReviewReport from "@/components/ReviewReport";
export default async function ReportDetail({params}:{params:{id:string}}){
 const s=createClient();const {data:{user}}=await s.auth.getUser();
 const {data:r}=await s.from("reports").select("*, profiles:submitted_by(full_name,rank_title,department)").eq("id",params.id).single();
 if(!r) notFound();
 const {data:p}=await s.from("profiles").select("role").eq("id",user!.id).single();
 const manager=["supervisor","officer","section_head","deputy_director","director","brigadier","system_admin"].includes(p?.role);
 const labels:Record<string,string>={pending:"قيد المراجعة",approved:"مقبول",rejected:"مرفوض"};
 return <><div className="page-head"><div><h1>تفاصيل التقرير</h1><p>مرجع التقرير: {r.id}</p></div><Link href="/reports" className="btn">عودة للتقارير</Link></div>
 <div className="card"><div className="section-title"><h2>{r.title}</h2><span className={`pill ${r.status==="approved"?"green":r.status==="rejected"?"red":"gold"}`}>{labels[r.status]||r.status}</span></div>
 <div className="grid two-col"><div><p className="muted">مقدم التقرير</p><strong>{r.profiles?.full_name||"—"}</strong></div><div><p className="muted">النوع / القطاع</p><strong>{r.report_type} · {r.department}</strong></div><div><p className="muted">تاريخ الرفع</p><strong>{new Date(r.created_at).toLocaleString("ar-SA")}</strong></div></div>
 <hr style={{border:0,borderTop:"1px solid var(--line)",margin:"22px 0"}}/><h3>تفاصيل التقرير</h3><p style={{whiteSpace:"pre-wrap",lineHeight:2,color:"#d6deeb"}}>{r.body}</p>
 {r.review_note&&<div className="notice"><strong>ملاحظة المراجع:</strong><p>{r.review_note}</p></div>}
 {manager&&r.status==="pending"&&<ReviewReport id={r.id}/>}
 </div></>;
}
