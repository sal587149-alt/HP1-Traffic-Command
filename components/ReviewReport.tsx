"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
export default function ReviewReport({id}:{id:string}){
 const [note,setNote]=useState("");const [error,setError]=useState("");const [busy,setBusy]=useState(false);const router=useRouter();
 async function review(status:"approved"|"rejected"){setBusy(true);setError("");const s=createClient();const {error}=await s.from("reports").update({status,review_note:note.trim()||null}).eq("id",id).eq("status","pending");if(error){setError("تعذر تحديث الحالة. تحقق من صلاحيات المراجعة.");setBusy(false);return}router.refresh();setBusy(false);}
 return <div style={{marginTop:25,borderTop:"1px solid var(--line)",paddingTop:20}}><h3>مراجعة التقرير</h3><div className="field"><label>ملاحظة المراجع (مطلوبة عند الرفض)</label><textarea className="textarea" value={note} onChange={e=>setNote(e.target.value)} placeholder="سبب القرار أو ملاحظات المراجعة..."/></div>{error&&<div className="error" style={{marginTop:12}}>{error}</div>}<div className="actions" style={{marginTop:14}}><button className="btn gold" disabled={busy} onClick={()=>review("approved")}>اعتماد التقرير</button><button className="btn danger" disabled={busy||!note.trim()} onClick={()=>review("rejected")}>رفض مع السبب</button></div></div>;
}
