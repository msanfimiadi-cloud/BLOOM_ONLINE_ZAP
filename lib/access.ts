import {getAuthenticatedUser} from "@/app/auth";
import {database,id,now} from "@/lib/booking";

export type Access={email:string;name:string;role:"owner"|"partner";organizationId:string|null};

export async function currentAccess():Promise<Access|null>{
 const user=await getAuthenticatedUser();if(!user)return null;
 const email=user.email.trim().toLowerCase(),db=database();
 let record=await db.prepare("SELECT * FROM account_access WHERE email=? AND active=1").bind(email).first<Record<string,any>>();
 if(!record){
   const owner=await db.prepare("SELECT id FROM account_access WHERE role='owner' LIMIT 1").first();
   const configured=(process.env.OWNER_EMAIL??"").trim().toLowerCase();
   if(!owner&&(!configured||configured===email)){
    await db.prepare("INSERT OR IGNORE INTO account_access (id,email,display_name,role,organization_id,active,created_at) VALUES (?,?,?,'owner',NULL,1,?)").bind(id("acc"),email,user.displayName,now()).run();
    record=await db.prepare("SELECT * FROM account_access WHERE email=? AND active=1").bind(email).first<Record<string,any>>();
   }
 }
 if(!record)return null;
 return{email,name:record.display_name||user.displayName,role:record.role==="owner"?"owner":"partner",organizationId:record.organization_id??null};
}

export function canAccessOrganization(access:Access,organizationId:string){return access.role==="owner"||access.organizationId===organizationId}
