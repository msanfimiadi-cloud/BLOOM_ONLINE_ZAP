import {currentAccess,canAccessOrganization} from "@/lib/access";
import {database,id,now} from "@/lib/booking";

const maxImageBytes=3*1024*1024;
function fail(message:string,status=400){return Response.json({error:message},{status})}

function detectImage(bytes:Buffer){
 if(bytes.length>=3&&bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return "image/jpeg";
 if(bytes.length>=8&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return "image/png";
 if(bytes.length>=12&&bytes.subarray(0,4).toString("ascii")==="RIFF"&&bytes.subarray(8,12).toString("ascii")==="WEBP")return "image/webp";
 return null;
}

export async function GET(request:Request){
 const mediaId=new URL(request.url).searchParams.get("id")??"";
 if(!/^img_[a-f0-9]{16}$/.test(mediaId))return new Response(null,{status:404});
 const image=await database().prepare("SELECT mime_type,content FROM uploaded_media WHERE id=?").bind(mediaId).first<{mime_type:string;content:Buffer}>();
 if(!image)return new Response(null,{status:404});
 return new Response(new Uint8Array(image.content),{headers:{"Content-Type":image.mime_type,"Cache-Control":"public, max-age=31536000, immutable","X-Content-Type-Options":"nosniff"}});
}

export async function POST(request:Request){
 try{
  const access=await currentAccess();if(!access)return fail("Войдите в личный кабинет.",401);
  const form=await request.formData(),file=form.get("image"),organizationId=String(form.get("organizationId")??"").trim();
  if(!(file instanceof File)||!file.size)return fail("Выберите фотографию.");
  if(file.size>maxImageBytes)return fail("Размер фотографии не должен превышать 3 МБ.",413);
  if(access.role!=="owner"&&(!organizationId||!canAccessOrganization(access,organizationId)))return fail("У вас нет доступа к этому салону.",403);
  if(organizationId&&!canAccessOrganization(access,organizationId))return fail("У вас нет доступа к этому салону.",403);
  if(organizationId){const organization=await database().prepare("SELECT id FROM organizations WHERE id=?").bind(organizationId).first();if(!organization)return fail("Салон не найден.",404)}
  const bytes=Buffer.from(await file.arrayBuffer()),mimeType=detectImage(bytes);if(!mimeType)return fail("Поддерживаются фотографии JPG, PNG и WEBP.",415);
  const mediaId=id("img");await database().prepare("INSERT INTO uploaded_media (id,organization_id,mime_type,content,created_at) VALUES (?,?,?,?,?)").bind(mediaId,organizationId||null,mimeType,bytes,now()).run();
  return Response.json({url:`/api/media?id=${mediaId}`},{status:201});
 }catch(error){return fail(error instanceof Error?error.message:"Не удалось загрузить фотографию.",500)}
}
