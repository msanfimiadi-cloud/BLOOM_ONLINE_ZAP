import {randomBytes,timingSafeEqual} from "node:crypto";
import {currentAccess,canAccessOrganization} from "@/lib/access";
import {database,id,now,sha256} from "@/lib/booking";
import {telegramConfigured} from "@/lib/telegram";

type Dict=Record<string,unknown>;
function fail(message:string,status=400){return Response.json({error:message},{status})}

function botAuthorized(request:Request){
 const expected=process.env.TELEGRAM_BOT_TOKEN??"",provided=(request.headers.get("authorization")??"").replace(/^Bearer\s+/i,"");
 if(expected.length<10||!provided)return false;
 const left=Buffer.from(expected),right=Buffer.from(provided);return left.length===right.length&&timingSafeEqual(left,right);
}

async function botUsername(){
 const response=await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`,{signal:AbortSignal.timeout(8000)});
 const data=await response.json() as {ok?:boolean;result?:{username?:string}};
 if(!response.ok||!data.ok||!data.result?.username)throw new Error("Не удалось определить Telegram-бота. Проверьте токен.");
 return data.result.username;
}

async function createLink(request:Request){
 const access=await currentAccess();if(!access)return fail("Доступ в кабинет не предоставлен.",403);
 if(!telegramConfigured())return fail("Сначала подключите токен существующего Telegram-бота.",503);
 const payload=await request.json() as Dict,organizationId=String(payload.organizationId??"");
 if(!organizationId||!canAccessOrganization(access,organizationId))return fail("У вас нет доступа к этому партнёру.",403);
 const organization=await database().prepare("SELECT id,name FROM organizations WHERE id=? AND active=1").bind(organizationId).first<{id:string;name:string}>();
 if(!organization)return fail("Партнёр не найден.",404);
 const username=await botUsername(),token=randomBytes(24).toString("hex"),created=now(),expires=new Date(Date.now()+15*60_000).toISOString();
 await database().prepare("INSERT INTO telegram_link_tokens (id,organization_id,token_hash,created_at,expires_at) VALUES (?,?,?,?,?)").bind(id("tgl"),organizationId,await sha256(token),created,expires).run();
 return Response.json({success:true,url:`https://t.me/${username}?start=bloomonline_${token}`,expiresAt:expires});
}

async function bindChat(request:Request){
 if(!botAuthorized(request))return fail("Не разрешено.",401);
 const payload=await request.json() as Dict,token=String(payload.token??""),chatId=String(payload.chatId??"");
 if(!/^[a-f0-9]{48}$/.test(token)||!/^\d{5,20}$/.test(chatId))return fail("Проверьте ссылку подключения и личный Telegram ID.");
 const moment=now(),record=await database().prepare("SELECT t.id,t.organization_id,o.name FROM telegram_link_tokens t JOIN organizations o ON o.id=t.organization_id WHERE t.token_hash=? AND t.used_at IS NULL AND t.expires_at>? AND o.active=1").bind(await sha256(token),moment).first<{id:string;organization_id:string;name:string}>();
 if(!record)return fail("Ссылка уже использована или срок её действия истёк.",410);
 const results=await database().batch([
  database().prepare("UPDATE organizations SET telegram_chat_id=?,notifications_enabled=1 WHERE id=? AND EXISTS (SELECT 1 FROM telegram_link_tokens WHERE id=? AND used_at IS NULL AND expires_at>?)").bind(chatId,record.organization_id,record.id,moment),
  database().prepare("UPDATE telegram_link_tokens SET used_at=? WHERE id=? AND used_at IS NULL").bind(moment,record.id),
 ]);
 if(Number((results[0] as {changes?:number})?.changes??0)!==1)return fail("Ссылка уже использована.",409);
 return Response.json({success:true,organizationName:record.name});
}

export async function POST(request:Request){try{return request.headers.has("authorization")?await bindChat(request):await createLink(request)}catch(error){return fail(error instanceof Error?error.message:"Не удалось подключить Telegram.",500)}}
