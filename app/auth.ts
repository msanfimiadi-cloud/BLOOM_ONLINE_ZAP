import {createHmac,timingSafeEqual} from "node:crypto";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";

export type AuthenticatedUser={displayName:string;email:string};
const cookieName="bloom_online_session";
const lifetime=60*60*24*14;

function secret(){const value=process.env.SESSION_SECRET??"";if(value.length<32)throw new Error("SESSION_SECRET должен содержать не менее 32 символов.");return value}
function sign(value:string){return createHmac("sha256",secret()).update(value).digest("base64url")}

export async function getAuthenticatedUser():Promise<AuthenticatedUser|null>{
 const token=(await cookies()).get(cookieName)?.value;if(!token)return null;
 const [payload,signature]=token.split(".");if(!payload||!signature)return null;
 const expected=sign(payload),a=Buffer.from(signature),b=Buffer.from(expected);if(a.length!==b.length||!timingSafeEqual(a,b))return null;
 try{const data=JSON.parse(Buffer.from(payload,"base64url").toString("utf8")) as {email?:string;displayName?:string;expires?:number};if(!data.email||!data.expires||data.expires<Date.now())return null;return{email:data.email,displayName:data.displayName||data.email}}catch{return null}
}

export async function createSession(user:AuthenticatedUser){
 const payload=Buffer.from(JSON.stringify({...user,expires:Date.now()+lifetime*1000})).toString("base64url");
 (await cookies()).set(cookieName,`${payload}.${sign(payload)}`,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:lifetime});
}
export async function deleteSession(){(await cookies()).delete(cookieName)}
export async function requireAuthenticatedUser(returnTo:string){const user=await getAuthenticatedUser();if(user)return user;redirect(`/login?return_to=${encodeURIComponent(returnTo)}`)}
