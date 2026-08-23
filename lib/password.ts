import {randomBytes,scrypt as scryptCallback,timingSafeEqual} from "node:crypto";
import {promisify} from "node:util";
const scrypt=promisify(scryptCallback);
export async function hashPassword(password:string){const salt=randomBytes(16).toString("hex"),hash=await scrypt(password,salt,64) as Buffer;return `scrypt:${salt}:${hash.toString("hex")}`}
export async function verifyPassword(password:string,stored:string){const [,salt,hex]=stored.split(":");if(!salt||!hex)return false;const actual=await scrypt(password,salt,64) as Buffer,expected=Buffer.from(hex,"hex");return actual.length===expected.length&&timingSafeEqual(actual,expected)}
export function validPassword(password:string){return password.length>=12&&password.length<=128}
