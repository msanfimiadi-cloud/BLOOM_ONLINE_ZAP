import {randomBytes,timingSafeEqual} from "node:crypto";
import {database,id,now,sha256} from "@/lib/booking";
import {telegramConfigured} from "@/lib/telegram";

type Dict=Record<string,unknown>;
function fail(message:string,status=400){return Response.json({error:message},{status})}
function botAuthorized(request:Request){const expected=process.env.TELEGRAM_BOT_TOKEN??"",provided=(request.headers.get("authorization")??"").replace(/^Bearer\s+/i,"");if(expected.length<10||!provided)return false;const left=Buffer.from(expected),right=Buffer.from(provided);return left.length===right.length&&timingSafeEqual(left,right)}
async function botUsername(){const response=await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`,{signal:AbortSignal.timeout(8000)}),data=await response.json() as {ok?:boolean;result?:{username?:string}};if(!response.ok||!data.ok||!data.result?.username)throw new Error("Не удалось определить Telegram-бота. Проверьте токен.");return data.result.username}

async function createCustomerLink(request:Request){
 if(!telegramConfigured())return fail("Telegram-уведомления пока не настроены.",503);
 const payload=await request.json() as Dict,appointmentId=String(payload.appointmentId??""),publicToken=String(payload.publicToken??"");
 const appointment=await database().prepare("SELECT id,status FROM appointments WHERE id=? AND public_token=? AND public_token!=''").bind(appointmentId,publicToken).first<{id:string;status:string}>();
 if(!appointment)return fail("Запись не найдена.",404);if(appointment.status==="cancelled")return fail("Отменённую запись нельзя подключить к уведомлениям.",409);
 const token=randomBytes(24).toString("hex"),created=now(),expires=new Date(Date.now()+24*60*60_000).toISOString();
 await database().prepare("INSERT INTO appointment_telegram_links (id,appointment_id,token_hash,created_at,expires_at) VALUES (?,?,?,?,?)").bind(id("atl"),appointment.id,await sha256(token),created,expires).run();
 return Response.json({success:true,url:`https://t.me/${await botUsername()}?start=bloombooking_${token}`,expiresAt:expires});
}

async function bindCustomerChat(request:Request){
 if(!botAuthorized(request))return fail("Не разрешено.",401);
 const payload=await request.json() as Dict,token=String(payload.token??""),chatId=String(payload.chatId??"");if(!/^[a-f0-9]{48}$/.test(token)||!/^\d{5,20}$/.test(chatId))return fail("Проверьте ссылку подключения и Telegram ID.");
 const moment=now(),record=await database().prepare("SELECT l.id,l.appointment_id,a.status,a.appointment_date,a.appointment_time,a.price,a.public_token,o.name AS organization_name,o.address,o.city,s.name AS staff_name,v.name AS service_name FROM appointment_telegram_links l JOIN appointments a ON a.id=l.appointment_id JOIN organizations o ON o.id=a.organization_id JOIN staff s ON s.id=a.staff_id JOIN services v ON v.id=a.service_id WHERE l.token_hash=? AND l.used_at IS NULL AND l.expires_at>? AND a.status!='cancelled'").bind(await sha256(token),moment).first<Record<string,any>>();
 if(!record)return fail("Ссылка уже использована, истекла или запись отменена.",410);
 const results=await database().batch([database().prepare("UPDATE appointments SET customer_telegram_chat_id=?,customer_notifications_enabled=1 WHERE id=? AND EXISTS (SELECT 1 FROM appointment_telegram_links WHERE id=? AND used_at IS NULL AND expires_at>?)").bind(chatId,record.appointment_id,record.id,moment),database().prepare("UPDATE appointment_telegram_links SET used_at=? WHERE id=? AND used_at IS NULL").bind(moment,record.id)]);
 if(Number((results[0] as {changes?:number})?.changes??0)!==1)return fail("Ссылка уже использована.",409);
 return Response.json({success:true,appointment:{organizationName:record.organization_name,serviceName:record.service_name,staffName:record.staff_name,date:record.appointment_date,time:record.appointment_time,price:record.price,address:[record.city,record.address].filter(Boolean).join(", "),manageUrl:`${process.env.PUBLIC_URL??"https://online.bloomclub.ru"}/appointment/${record.appointment_id}?token=${encodeURIComponent(record.public_token)}`}});
}

export async function POST(request:Request){try{return request.headers.has("authorization")?await bindCustomerChat(request):await createCustomerLink(request)}catch(error){return fail(error instanceof Error?error.message:"Не удалось подключить уведомления.",500)}}
