import { getChatGPTUser } from "@/app/chatgpt-auth";
import { asMinutes, database, formatTime, id, now, seedDemoData } from "@/lib/booking";

type Dict = Record<string, any>;

function fail(message: string, status = 400) { return Response.json({error: message}, {status}); }

export async function GET(request: Request) {
  try {
    await seedDemoData();
    const db = database(), url = new URL(request.url), kind = url.searchParams.get("kind") ?? "organizations";
    if (kind === "organizations") {
      const {results} = await db.prepare("SELECT o.*, (SELECT COUNT(*) FROM staff s WHERE s.organization_id=o.id AND s.active=1) AS staff_count, (SELECT MIN(price) FROM services v WHERE v.organization_id=o.id AND v.active=1) AS min_price FROM organizations o WHERE o.active=1 ORDER BY o.created_at, o.name").all();
      return Response.json({organizations:results});
    }
    if (kind === "organization") {
      const slug = url.searchParams.get("slug");
      if (!slug) return fail("Не указан партнёр.");
      const organization = await db.prepare("SELECT * FROM organizations WHERE slug=? AND active=1").bind(slug).first<Dict>();
      if (!organization) return fail("Партнёр не найден.",404);
      const members = await db.prepare("SELECT * FROM staff WHERE organization_id=? AND active=1 ORDER BY name").bind(organization.id).all();
      const offerings = await db.prepare("SELECT * FROM services WHERE organization_id=? AND active=1 ORDER BY price").bind(organization.id).all();
      return Response.json({organization, staff:members.results, services:offerings.results});
    }
    if (kind === "slots") {
      const staffId=url.searchParams.get("staffId"), serviceId=url.searchParams.get("serviceId"), date=url.searchParams.get("date");
      if (!staffId || !serviceId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail("Выберите мастера, услугу и дату.");
      const member=await db.prepare("SELECT * FROM staff WHERE id=? AND active=1").bind(staffId).first<Dict>();
      const service=await db.prepare("SELECT * FROM services WHERE id=? AND active=1").bind(serviceId).first<Dict>();
      if (!member || !service || member.organization_id !== service.organization_id) return fail("Мастер или услуга недоступны.",404);
      const booked=await db.prepare("SELECT appointment_time,duration FROM appointments WHERE staff_id=? AND appointment_date=? AND status!='cancelled'").bind(staffId,date).all<Dict>();
      const slots:string[]=[];
      for(let minute=asMinutes(member.work_start);minute+Number(service.duration)<=asMinutes(member.work_end);minute+=30){
        if (!booked.results.some((item)=>minute<asMinutes(item.appointment_time)+Number(item.duration)&&minute+Number(service.duration)>asMinutes(item.appointment_time))) slots.push(formatTime(minute));
      }
      return Response.json({slots});
    }
    if (kind === "dashboard") {
      const user=await getChatGPTUser(); if(!user)return fail("Необходим вход в кабинет.",401);
      const organizationId=url.searchParams.get("organizationId");
      const orgs=await db.prepare("SELECT * FROM organizations ORDER BY created_at").all<Dict>();
      const filter=organizationId ? " WHERE a.organization_id=?" : "";
      let query=db.prepare(`SELECT a.*,o.name AS organization_name,s.name AS staff_name,v.name AS service_name FROM appointments a JOIN organizations o ON o.id=a.organization_id JOIN staff s ON s.id=a.staff_id JOIN services v ON v.id=a.service_id${filter} ORDER BY a.appointment_date DESC,a.appointment_time DESC LIMIT 200`);
      if(organizationId)query=query.bind(organizationId);
      const bookings=await query.all<Dict>();
      const staff=organizationId?await db.prepare("SELECT * FROM staff WHERE organization_id=? ORDER BY name").bind(organizationId).all<Dict>():await db.prepare("SELECT * FROM staff ORDER BY name").all<Dict>();
      const services=organizationId?await db.prepare("SELECT * FROM services WHERE organization_id=? ORDER BY name").bind(organizationId).all<Dict>():await db.prepare("SELECT * FROM services ORDER BY name").all<Dict>();
      return Response.json({organizations:orgs.results,appointments:bookings.results,staff:staff.results,services:services.results,user:{name:user.displayName,email:user.email}});
    }
    return fail("Неизвестный запрос.",404);
  } catch(error) { return fail(error instanceof Error?error.message:"Ошибка сервера.",500); }
}

export async function POST(request:Request){
 try{
  await seedDemoData();const db=database(),payload=await request.json() as Dict,action=String(payload.action??"book");
  if(action==="book"){
    const name=String(payload.customerName??"").trim(),phone=String(payload.customerPhone??"").trim(),date=String(payload.date??""),time=String(payload.time??"");
    if(name.length<2||phone.replace(/\D/g,"").length<10||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time))return fail("Проверьте имя, номер телефона, дату и время.");
    const member=await db.prepare("SELECT * FROM staff WHERE id=? AND active=1").bind(String(payload.staffId??"")).first<Dict>();
    const service=await db.prepare("SELECT * FROM services WHERE id=? AND active=1").bind(String(payload.serviceId??"")).first<Dict>();
    if(!member||!service||member.organization_id!==service.organization_id)return fail("Выбранные мастер и услуга несовместимы.");
    const start=asMinutes(time),end=start+Number(service.duration);if(start<asMinutes(member.work_start)||end>asMinutes(member.work_end))return fail("Время находится вне графика мастера.");
    const bookingId=id("apt"),created=now();
    const result=await db.prepare("INSERT INTO appointments (id, organization_id, staff_id, service_id, customer_name, customer_phone, appointment_date, appointment_time, duration, price, status, source, notes, created_at) SELECT ?,?,?,?,?,?,?,?,?,?,'confirmed',?,?,? WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE staff_id=? AND appointment_date=? AND status!='cancelled' AND (CAST(substr(appointment_time,1,2) AS INTEGER)*60+CAST(substr(appointment_time,4,2) AS INTEGER))<? AND (CAST(substr(appointment_time,1,2) AS INTEGER)*60+CAST(substr(appointment_time,4,2) AS INTEGER)+duration)>?)").bind(bookingId,member.organization_id,member.id,service.id,name,phone,date,time,service.duration,service.price,String(payload.source??"bloom"),String(payload.notes??""),created,member.id,date,end,start).run();
    if(!result.meta?.changes)return fail("Это время только что заняли. Выберите другой интервал.",409);
    return Response.json({success:true,id:bookingId},{status:201});
  }
  const user=await getChatGPTUser();if(!user)return fail("Необходим вход в кабинет.",401);
  if(action==="update-status"){
    if(!["confirmed","completed","cancelled","no_show"].includes(String(payload.status)))return fail("Недопустимый статус.");
    await db.prepare("UPDATE appointments SET status=? WHERE id=?").bind(payload.status,String(payload.id??"")).run();return Response.json({success:true});
  }
  if(action==="add-organization"){
    const name=String(payload.name??"").trim(),slug=String(payload.slug??"").trim().toLowerCase();if(name.length<2||!/^[-a-z0-9]{3,50}$/.test(slug))return fail("Укажите название и адрес страницы латиницей.");
    await db.prepare("INSERT INTO organizations (id,slug,name,city,address,category,description,phone,color,active,created_at) VALUES (?,?,?,?,?,?,?,?,?,1,?)").bind(id("org"),slug,name,String(payload.city??"Новосибирск"),String(payload.address??""),String(payload.category??"Красота и уход"),String(payload.description??""),String(payload.phone??""),"#f6e7e2",now()).run();return Response.json({success:true},{status:201});
  }
  if(action==="add-staff"){
    const name=String(payload.name??"").trim();if(name.length<2||!payload.organizationId)return fail("Укажите партнёра и имя специалиста.");
    await db.prepare("INSERT INTO staff (id,organization_id,name,role,active,work_start,work_end,created_at) VALUES (?,?,?,?,1,?,?,?)").bind(id("st"),String(payload.organizationId),name,String(payload.role??"Специалист"),String(payload.workStart??"10:00"),String(payload.workEnd??"19:00"),now()).run();return Response.json({success:true},{status:201});
  }
  if(action==="add-service"){
    const name=String(payload.name??"").trim(),price=Number(payload.price),duration=Number(payload.duration);if(name.length<2||!payload.organizationId||!Number.isInteger(price)||price<0||!Number.isInteger(duration)||duration<15)return fail("Проверьте название, стоимость и длительность услуги.");
    await db.prepare("INSERT INTO services (id,organization_id,name,price,duration,active,created_at) VALUES (?,?,?,?,?,1,?)").bind(id("sv"),String(payload.organizationId),name,price,duration,now()).run();return Response.json({success:true},{status:201});
  }
  return fail("Неизвестное действие.");
 }catch(error){const message=error instanceof Error?error.message:"Ошибка сервера.";return fail(message.includes("UNIQUE")?"Такая запись уже существует.":message,message.includes("UNIQUE")?409:500)}
}
