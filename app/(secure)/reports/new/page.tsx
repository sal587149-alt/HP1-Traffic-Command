"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
export default function NewReportPage(){
 const [title,setTitle]=useState("");const [type,setType]=useState("تقرير دورية");const [department,setDepartment]=useState("المرور");const [body,setBody]=useState("");const [busy,setBusy]=useState(false);const [error,setError]=useState("");const router=useRouter();
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");const s=createClient();const {data:{user}}=await s.auth.getUser();if(!user){router.push("/login");return}
 const {error}=await s.from("reports").insert({title:title.trim(),report_type:type,department,body:body.trim(),submitted_by:user.id});
 if(error){setError("تعذر حفظ التقرير. تحقق من إعداد قاعدة البيانات والحقول المطلوبة.");setBusy(false);return}router.push("/reports");router.refresh();}
 return <><div className="page-head"><div><h1>رفع تقرير جديد</h1><p>أدخل تفاصيل دقيقة. تأكد من عدم تضمين معلومات خارج نطاق العمل.</p></div></div>{error&&<div className="error">{error}</div>}<form className="card" onSubmit={submit}><div className="form-grid">
 <div className="field"><label>عنوان التقرير *</label><input className="input" required maxLength={120} value={title} onChange={e=>setTitle(e.target.value)} placeholder="مثال: تقرير دورية مسائية"/></div>
 <div className="field"><label>نوع التقرير *</label><select className="select" value={type} onChange={e=>setType(e.target.value)}><option>تقرير دورية</option><option>تقرير مرور سري</option><option>تقرير حملة مرورية</option><option>تقرير ضبط</option><option>تقرير إداري</option><option>تقرير أسبوعي</option></select></div>
 <div className="field"><label>القسم / القطاع *</label><select className="select" value={department} onChange={e=>setDepartment(e.target.value)}><option>المرور</option><option>الدوريات</option><option>المرور السري</option><option>العمليات</option><option>الإدارة</option></select></div>
 <div className="field span-2"><label>تفاصيل التقرير *</label><textarea className="textarea" required minLength={10} maxLength={8000} value={body} onChange={e=>setBody(e.target.value)} placeholder="اكتب ملخص المهمة والإجراءات والنتائج..."/></div>
 <div className="span-2 notice">هذه النسخة الأساسية لا ترفع المرفقات بعد. يمكن إضافة رفع الصور والملفات إلى مخزن خاص في المرحلة التالية، مع التحقق من نوع الملف وحجمه.</div>
 <div className="span-2 actions"><button className="btn gold" disabled={busy}>{busy?"جارٍ الحفظ...":"إرسال التقرير"}</button><button type="button" className="btn" onClick={()=>router.back()}>إلغاء</button></div>
 </div></form></>;
}
