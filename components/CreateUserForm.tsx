"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {Role,ROLE_LABELS} from "@/lib/types";
const roles:Role[]=["soldier","supervisor","officer","section_head","deputy_director","director","brigadier","system_admin"];
export default function CreateUserForm(){const [name,setName]=useState("");const [email,setEmail]=useState("");const [password,setPassword]=useState("");const [rank,setRank]=useState("جندي");const [department,setDepartment]=useState("المرور");const [role,setRole]=useState<Role>("soldier");const [error,setError]=useState("");const [success,setSuccess]=useState("");const [busy,setBusy]=useState(false);const router=useRouter();
async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");setSuccess("");const res=await fetch("/api/admin/users",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({full_name:name,email,password,rank_title:rank,department,role})});const data=await res.json().catch(()=>({}));if(!res.ok){setError(data.error||"تعذر إنشاء الحساب.");setBusy(false);return}setSuccess("تم إنشاء الحساب بنجاح. أرسل بيانات الدخول للمستخدم عبر قناة آمنة.");setName("");setEmail("");setPassword("");setBusy(false);router.refresh();}
return <form className="card" onSubmit={submit}><div className="section-title"><h2>إنشاء حساب جديد</h2><span>حقول مطلوبة *</span></div><div className="form-grid">
<div className="field"><label>الاسم الكامل *</label><input className="input" required maxLength={100} value={name} onChange={e=>setName(e.target.value)}/></div>
<div className="field"><label>البريد الإلكتروني *</label><input className="input" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></div>
<div className="field"><label>كلمة مرور مؤقتة (12 حرفًا على الأقل) *</label><input className="input" type="password" minLength={12} required value={password} onChange={e=>setPassword(e.target.value)}/></div>
<div className="field"><label>الرتبة الظاهرة *</label><input className="input" required value={rank} onChange={e=>setRank(e.target.value)} maxLength={80}/></div>
<div className="field"><label>الدور داخل النظام *</label><select className="select" value={role} onChange={e=>setRole(e.target.value as Role)}>{roles.map(r=><option key={r} value={r}>{ROLE_LABELS[r]}</option>)}</select></div>
<div className="field"><label>القطاع *</label><select className="select" value={department} onChange={e=>setDepartment(e.target.value)}><option>المرور</option><option>الدوريات</option><option>المرور السري</option><option>العمليات</option><option>الإدارة</option></select></div>
<div className="span-2 actions"><button className="btn gold" disabled={busy}>{busy?"جارٍ إنشاء الحساب...":"إنشاء الحساب"}</button></div>
</div>{error&&<div className="error" style={{marginTop:14}}>{error}</div>}{success&&<div className="success" style={{marginTop:14}}>{success}</div>}</form>}
