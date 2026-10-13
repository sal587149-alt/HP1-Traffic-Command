import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Role } from "@/lib/types";

const allowedRoles:Role[]=["soldier","supervisor","officer","section_head","deputy_director","director","brigadier","system_admin"];
export async function POST(request:Request){
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"يجب تسجيل الدخول."},{status:401});
  const {data:actor}=await supabase.from("profiles").select("role").eq("id",user.id).single();
  if(!actor||!["director","brigadier","system_admin"].includes(actor.role))return NextResponse.json({error:"ليست لديك صلاحية إنشاء الحسابات."},{status:403});
  const payload=await request.json().catch(()=>null);
  if(!payload)return NextResponse.json({error:"بيانات غير صالحة."},{status:400});
  const {full_name,email,password,rank_title,department,role}=payload;
  if(typeof full_name!=="string"||full_name.trim().length<2||full_name.length>100||typeof email!=="string"||!email.includes("@")||typeof password!=="string"||password.length<12||password.length>128||typeof rank_title!=="string"||typeof department!=="string"||!allowedRoles.includes(role))return NextResponse.json({error:"تحقق من الحقول المطلوبة وكلمة المرور (12 حرفًا على الأقل)."}, {status:400});
  // Only system admins may create another system admin; this prevents routine privilege escalation.
  if(role==="system_admin"&&actor.role!=="system_admin")return NextResponse.json({error:"إنشاء مسؤول نظام جديد يتطلب مسؤول نظام حاليًا."},{status:403});
  const admin=createAdminClient();
  const {data:created,error:createError}=await admin.auth.admin.createUser({email:email.trim().toLowerCase(),password,email_confirm:true,user_metadata:{full_name:full_name.trim()}});
  if(createError||!created.user)return NextResponse.json({error:"تعذر إنشاء الحساب. قد يكون البريد مستخدمًا مسبقًا."},{status:400});
  const {error:profileError}=await admin.from("profiles").upsert({id:created.user.id,full_name:full_name.trim(),email:email.trim().toLowerCase(),rank_title:rank_title.trim(),department:department.trim(),role,is_active:true});
  if(profileError){await admin.auth.admin.deleteUser(created.user.id);return NextResponse.json({error:"تعذر حفظ الملف العسكري، وتم إلغاء الحساب."},{status:500});}
  await admin.from("audit_logs").insert({actor_id:user.id,action:"user_created",target_id:created.user.id,details:{role,department}});
  return NextResponse.json({ok:true,user_id:created.user.id});
}
