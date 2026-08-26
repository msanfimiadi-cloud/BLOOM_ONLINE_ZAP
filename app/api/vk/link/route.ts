import {randomBytes,timingSafeEqual} from "node:crypto";
import {currentAccess,canAccessOrganization} from "@/lib/access";
import {database,id,now,sha256} from "@/lib/booking";
import {vkConfigured} from "@/lib/telegram";

type Dict=Record<string,unknown>;
function fail(message:string,status=400){return Response.json({error:message},{status})}

function serviceAuthorized(request:Request){
 const expected=process.env.BLOOM_ONLINE_API_TOKEN??"",provided=(request.headers.get("authorization")??"").replace(/^Bearer\s+/i,"");
 if(expected.length<32||!provided)return false;
 const left=Buffer.from(expected),right=Buffer.from(provided);return left.length===right.length&&timingSafeEqual(left,right);
}

async function createLink(request:Request){
 const access=await currentAccess();if(!access)return fail("Доступ в кабинет не предоставлен.",403);
 if(!vkConfigured())return fail("Сначала настройте адрес VK-бота и защищённое подключение к Bloom Club.",503);
 const payload=await request.json() as Dict,organizationId=String(payload.organizationId??"");
 if(!organizationId||!canAccessOrganization(access,organizationId))return fail("У вас нет доступа к этому салону.",403);
 const organization=await database().prepare("SELECT id FROM organizations WHERE id=? AND active=1").bind(organizationId).first();if(!organization)return fail("Салон не найден.",404);
 const token=randomBytes(24).toString("hex"),created=now(),expires=new Date(Date.now()+15*60_000).toISOString(),publicUrl=String(process.env.VK_BOT_PUBLIC_URL??"").trim().replace(/[?&]+$/,"");
 await database().prepare("INSERT INTO vk_link_tokens (id,organization_id,token_hash,created_at,expires_at) VALUES (?,?,?,?,?)").bind(id("vkl"),organizationId,await sha256(token),created,expires).run();
 const separator=publicUrl.includes("?")?"&":"?";return Response.json({success:true,url:`${publicUrl}${separator}ref=bloomonline_${token}`,expiresAt:expires});
}

async function bindVk(request:Request){
 if(!serviceAuthorized(request))return fail("Не разрешено.",401);
 const payload=await request.json() as Dict,token=String(payload.token??""),peerId=String(payload.peerId??"");
 if(!/^[a-f0-9]{48}$/.test(token)||!/^\d{1,20}$/.test(peerId)||peerId==="0")return fail("Проверьте ссылку подключения и VK ID.");
 const moment=now(),record=await database().prepare("SELECT t.id,t.organization_id,o.name FROM vk_link_tokens t JOIN organizations o ON o.id=t.organization_id WHERE t.token_hash=? AND t.used_at IS NULL AND t.expires_at>? AND o.active=1").bind(await sha256(token),moment).first<{id:string;organization_id:string;name:string}>();
 if(!record)return fail("Ссылка уже использована или срок её действия истёк.",410);
 const results=await database().batch([
  database().prepare("UPDATE organizations SET vk_peer_id=?,vk_notifications_enabled=1 WHERE id=? AND EXISTS (SELECT 1 FROM vk_link_tokens WHERE id=? AND used_at IS NULL AND expires_at>?)").bind(peerId,record.organization_id,record.id,moment),
  database().prepare("UPDATE vk_link_tokens SET used_at=? WHERE id=? AND used_at IS NULL").bind(moment,record.id),
 ]);
 if(Number((results[0] as {changes?:number})?.changes??0)!==1)return fail("Ссылка уже использована.",409);
 return Response.json({success:true,organizationName:record.name});
}

export async function POST(request:Request){try{return request.headers.has("authorization")?await bindVk(request):await createLink(request)}catch(error){return fail(error instanceof Error?error.message:"Не удалось подключить VK.",500)}}
