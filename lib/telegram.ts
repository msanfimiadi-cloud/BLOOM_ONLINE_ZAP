import {database,id,now} from "@/lib/booking";

type Dict=Record<string,any>;
export function telegramConfigured(){return typeof process.env.TELEGRAM_BOT_TOKEN==="string"&&process.env.TELEGRAM_BOT_TOKEN.trim().length>10}
export function vkConfigured(){return Boolean(process.env.BLOOM_CLUB_API_URL?.trim()&&process.env.BLOOM_ONLINE_API_TOKEN?.trim()&&process.env.VK_BOT_PUBLIC_URL?.trim())}

function esc(value:unknown){return String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}
async function sendMessage(chatId:string,text:string){
 const response=await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:chatId,text,parse_mode:"HTML",disable_web_page_preview:true}),signal:AbortSignal.timeout(8000)});
 const result=await response.json() as Dict;if(!response.ok||!result.ok)throw new Error(String(result.description??"Telegram отклонил сообщение"));
}
async function sendVkMessage(peerId:string,text:string){
 const base=String(process.env.BLOOM_CLUB_API_URL??"").replace(/\/$/,"");
 const response=await fetch(`${base}/booking/vk-notifications`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${process.env.BLOOM_ONLINE_API_TOKEN}`},body:JSON.stringify({peer_id:Number(peerId),message:text.replace(/<[^>]+>/g,"").replaceAll("&lt;","<").replaceAll("&gt;",">").replaceAll("&amp;","&")}),signal:AbortSignal.timeout(8000)});
 if(!response.ok){const result=await response.json().catch(()=>({})) as Dict;throw new Error(String(result.detail??"VK отклонил сообщение"))}
}

export async function notifyPartner(organizationId:string,appointmentId:string|null,eventType:string,extraMessage?:string,channelOnly?:"telegram"|"vk"){
 const db=database(),organization=await db.prepare("SELECT * FROM organizations WHERE id=?").bind(organizationId).first<Dict>();
 if(!organization)return{sent:false,reason:"Салон не найден"};
 let text=extraMessage??"";
 if(appointmentId){
  const appointment=await db.prepare("SELECT a.*,s.name AS staff_name,v.name AS service_name FROM appointments a JOIN staff s ON s.id=a.staff_id JOIN services v ON v.id=a.service_id WHERE a.id=? AND a.organization_id=?").bind(appointmentId,organizationId).first<Dict>();
  if(!appointment)return log(channelOnly??"telegram","failed","Запись не найдена");
  const title=eventType==="new_booking"?"🌸 Новая запись":eventType==="cancelled"?"❌ Запись отменена":"📝 Статус записи изменён";
  text=`<b>${title}</b>\n\n<b>Салон:</b> ${esc(organization.name)}\n<b>Клиент:</b> ${esc(appointment.customer_name)}\n<b>Телефон:</b> ${esc(appointment.customer_phone)}\n<b>Услуга:</b> ${esc(appointment.service_name)}\n<b>Мастер:</b> ${esc(appointment.staff_name)}\n<b>Дата:</b> ${esc(appointment.appointment_date)} в ${esc(appointment.appointment_time)}\n<b>Стоимость:</b> ${esc(appointment.price)} ₽\n<b>Источник:</b> ${esc(appointment.source==="bloom-club"?"Bloom Club":"Прямая запись")}`;
 }
 const results:{sent:boolean;reason:string}[]=[];
 if(channelOnly!=="vk"&&organization.notifications_enabled&&organization.telegram_chat_id){
  if(!telegramConfigured())results.push(await log("telegram","skipped","Токен Telegram-бота пока не настроен"));
  else try{await sendMessage(String(organization.telegram_chat_id),text);results.push(await log("telegram","sent","Telegram-уведомление отправлено"))}catch(error){results.push(await log("telegram","failed",error instanceof Error?error.message:"Не удалось отправить Telegram-уведомление"))}
 }
 if(channelOnly!=="telegram"&&organization.vk_notifications_enabled&&organization.vk_peer_id){
  if(!vkConfigured())results.push(await log("vk","skipped","Подключение к VK-боту пока не настроено"));
  else try{await sendVkMessage(String(organization.vk_peer_id),text);results.push(await log("vk","sent","VK-уведомление отправлено"))}catch(error){results.push(await log("vk","failed",error instanceof Error?error.message:"Не удалось отправить VK-уведомление"))}
 }
 if(!results.length)return{sent:false,reason:"Для салона не подключены каналы уведомлений"};
 return{sent:results.some(item=>item.sent),reason:results.map(item=>item.reason).join("; ")};

 async function log(channel:string,status:string,detail:string){await db.prepare("INSERT INTO notification_events (id,organization_id,appointment_id,channel,event_type,status,detail,created_at) VALUES (?,?,?,?,?,?,?,?)").bind(id("ntf"),organizationId,appointmentId,channel,eventType,status,detail,now()).run();return{sent:status==="sent",reason:detail}}
}

export async function notifyCustomer(appointmentId:string,eventType:string){
 if(!telegramConfigured())return{sent:false,reason:"Токен Telegram-бота пока не настроен"};
 const appointment=await database().prepare("SELECT a.*,o.name AS organization_name,o.city,o.address,s.name AS staff_name,v.name AS service_name FROM appointments a JOIN organizations o ON o.id=a.organization_id JOIN staff s ON s.id=a.staff_id JOIN services v ON v.id=a.service_id WHERE a.id=?").bind(appointmentId).first<Dict>();
 if(!appointment)return{sent:false,reason:"Запись не найдена"};
 if(!appointment.customer_notifications_enabled||!appointment.customer_telegram_chat_id)return{sent:false,reason:"Клиент не подключил Telegram-уведомления"};
 const title=eventType==="booking_cancelled"?"❌ Запись отменена":eventType==="booking_rescheduled"?"🗓 Запись перенесена":eventType==="booking_completed"?"✅ Визит завершён":eventType==="booking_no_show"?"⚠️ Отмечена неявка":"📝 Запись обновлена";
 const text=`<b>${title}</b>\n\n<b>Салон:</b> ${esc(appointment.organization_name)}\n<b>Услуга:</b> ${esc(appointment.service_name)}\n<b>Мастер:</b> ${esc(appointment.staff_name)}\n<b>Дата:</b> ${esc(appointment.appointment_date)} в ${esc(appointment.appointment_time)}\n<b>Стоимость:</b> ${esc(appointment.price)} ₽\n<b>Адрес:</b> ${esc([appointment.city,appointment.address].filter(Boolean).join(", "))}`;
 try{await sendMessage(String(appointment.customer_telegram_chat_id),text);return{sent:true,reason:"Уведомление клиенту отправлено"}}catch(error){return{sent:false,reason:error instanceof Error?error.message:"Не удалось отправить уведомление клиенту"}}
}
