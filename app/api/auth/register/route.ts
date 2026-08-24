import {createSession} from "@/app/auth";
import {legalDocumentVersion} from "@/app/legal-documents";
import {database,id,now} from "@/lib/booking";
import {hashPassword,validPassword} from "@/lib/password";

const alphabet:Record<string,string>={а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"e",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"ts",ч:"ch",ш:"sh",щ:"sch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya"};

function salonSlug(name:string){
 const base=Array.from(name.toLowerCase()).map(character=>alphabet[character]??character).join("").normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,38).replace(/-+$/g,"")||"salon";
 return `${base}-${crypto.randomUUID().replaceAll("-","").slice(0,8)}`;
}

export async function POST(request:Request){
 try{
  const body=await request.json() as Record<string,unknown>,email=String(body.email??"").trim().toLowerCase(),name=String(body.name??"").trim(),city=String(body.city??"").trim(),password=String(body.password??"");
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)return Response.json({error:"Укажите корректный адрес электронной почты."},{status:400});
  if(name.length<2||name.length>100)return Response.json({error:"Укажите название салона: от 2 до 100 символов."},{status:400});
  if(city.length<2||city.length>100)return Response.json({error:"Укажите город: от 2 до 100 символов."},{status:400});
  if(!validPassword(password))return Response.json({error:"Пароль должен содержать от 6 до 128 символов."},{status:400});
  if(body.offerAccepted!==true)return Response.json({error:"Для регистрации необходимо принять условия публичной оферты."},{status:400});
  if(body.personalDataConsent!==true)return Response.json({error:"Для регистрации необходимо отдельное согласие на обработку персональных данных."},{status:400});
  if(email===(process.env.OWNER_EMAIL??"").trim().toLowerCase())return Response.json({error:"Аккаунт с такой почтой уже существует. Попробуйте войти."},{status:409});
  const db=database(),existing=await db.prepare("SELECT id FROM account_access WHERE email=?").bind(email).first();
  if(existing)return Response.json({error:"Аккаунт с такой почтой уже существует. Попробуйте войти."},{status:409});
  const organizationId=id("org"),created=now(),passwordHash=await hashPassword(password);
  await db.batch([
   db.prepare("INSERT INTO organizations (id,slug,name,city,address,category,description,phone,color,active,published,created_at) VALUES (?,?,?,?,?,'Красота и уход','','','#f6e7e2',1,0,?)").bind(organizationId,salonSlug(name),name,city,"",created),
   db.prepare("INSERT INTO account_access (id,email,display_name,role,organization_id,password_hash,active,created_at) VALUES (?,?,?,'partner',?,?,1,?)").bind(id("acc"),email,name,organizationId,passwordHash,created),
   db.prepare("INSERT INTO legal_consent_events (id,organization_id,subject_identifier,document_type,document_version,context,created_at) VALUES (?,?,?,?,?,?,?)").bind(id("con"),organizationId,email,"offer",legalDocumentVersion,"salon_registration",created),
   db.prepare("INSERT INTO legal_consent_events (id,organization_id,subject_identifier,document_type,document_version,context,created_at) VALUES (?,?,?,?,?,?,?)").bind(id("con"),organizationId,email,"personal_data",legalDocumentVersion,"salon_registration",created),
  ]);
  await createSession({email,displayName:name});
  return Response.json({success:true,returnTo:"/dashboard"},{status:201});
 }catch(error){
  if(error instanceof Error&&/UNIQUE constraint failed: account_access\.email/.test(error.message))return Response.json({error:"Аккаунт с такой почтой уже существует. Попробуйте войти."},{status:409});
  console.error("Salon registration failed",error);
  return Response.json({error:"Регистрация временно недоступна. Попробуйте ещё раз."},{status:500});
 }
}
