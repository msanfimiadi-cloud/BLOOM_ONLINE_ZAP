import {createSession} from "@/app/auth";
import {database,id,now} from "@/lib/booking";
import {validPassword,verifyPassword} from "@/lib/password";

function safeReturnTo(value:unknown){const path=String(value??"/dashboard");return path.startsWith("/")&&!path.startsWith("//")?path:"/dashboard"}

export async function POST(request:Request){
 try{
  const body=await request.json() as Record<string,unknown>,email=String(body.email??"").trim().toLowerCase(),password=String(body.password??"");
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!validPassword(password))return Response.json({error:"Неверный email или пароль."},{status:401});
  const ownerEmail=(process.env.OWNER_EMAIL??"").trim().toLowerCase(),ownerPassword=process.env.OWNER_PASSWORD??"";
  let displayName="";
  if(email===ownerEmail&&ownerPassword&&password===ownerPassword){
   const db=database();let owner=await db.prepare("SELECT * FROM account_access WHERE email=? AND active=1").bind(email).first<Record<string,unknown>>();
   if(!owner){await db.prepare("INSERT INTO account_access (id,email,display_name,role,organization_id,password_hash,active,created_at) VALUES (?,?,?,'owner',NULL,'',1,?)").bind(id("acc"),email,"Владелец",now()).run();owner=await db.prepare("SELECT * FROM account_access WHERE email=?").bind(email).first<Record<string,unknown>>()}
   displayName=String(owner?.display_name||"Владелец");
  }else{
   const account=await database().prepare("SELECT * FROM account_access WHERE email=? AND active=1").bind(email).first<Record<string,unknown>>();
   if(!account||typeof account.password_hash!=="string"||!await verifyPassword(password,account.password_hash))return Response.json({error:"Неверный email или пароль."},{status:401});
   displayName=String(account.display_name||email);
  }
  await createSession({email,displayName});
  return Response.json({success:true,returnTo:safeReturnTo(body.returnTo)});
 }catch(error){console.error("Login failed",error);return Response.json({error:"Вход временно недоступен."},{status:500})}
}
