import { env } from "cloudflare:workers";

type Prepared = {bind(...values: unknown[]): Prepared; run(): Promise<{meta?:{changes?:number}}>; first<T = unknown>(): Promise<T | null>; all<T = unknown>(): Promise<{results: T[]}>};
type Binding = {prepare(query: string): Prepared; batch(statements: unknown[]): Promise<unknown[]>};

export function database(): Binding {
  if (!env.DB) throw new Error("База данных сервиса пока недоступна.");
  return env.DB as unknown as Binding;
}

export const id = (prefix: string) => `${prefix}_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`;
export const now = () => new Date().toISOString();

export async function seedDemoData() {
  const db = database();
  const row = await db.prepare("SELECT COUNT(*) AS count FROM organizations").first<{count:number}>();
  if (row?.count) return;
  const created = now();
  const orgs = [
    ["org_luna", "luna-studio", "Luna Studio", "Новосибирск", "ул. Ленина, 21", "Маникюр и педикюр", "Уютная студия маникюра в центре города. Забота о деталях и только профессиональные материалы.", "+7 383 200-00-01", "#f6e7e2"],
    ["org_balance", "balance-spa", "Balance SPA", "Новосибирск", "Красный проспект, 42", "Массаж и SPA", "Пространство, где можно остановиться, выдохнуть и восстановить внутренний баланс.", "+7 383 200-00-02", "#e7eee5"],
    ["org_forma", "forma-beauty", "Forma Beauty", "Москва", "ул. Малая Бронная, 18", "Волосы и укладки", "Современное beauty-пространство с внимательным подходом к каждому гостю.", "+7 495 200-00-03", "#f3ebdb"],
  ];
  const members = [
    ["st_luna_1", "org_luna", "Екатерина Морозова", "Мастер маникюра"], ["st_luna_2", "org_luna", "Анна Соколова", "Топ-мастер"],
    ["st_balance_1", "org_balance", "Мария Кузнецова", "Массажист"], ["st_balance_2", "org_balance", "Ольга Белова", "SPA-терапевт"],
    ["st_forma_1", "org_forma", "Полина Волкова", "Стилист"],
  ];
  const offerings = [
    ["sv_luna_1", "org_luna", "Маникюр с покрытием", 2200, 90], ["sv_luna_2", "org_luna", "Маникюр без покрытия", 1400, 60], ["sv_luna_3", "org_luna", "Педикюр с покрытием", 2700, 90],
    ["sv_balance_1", "org_balance", "Массаж всего тела", 3800, 90], ["sv_balance_2", "org_balance", "Массаж спины", 2200, 45], ["sv_balance_3", "org_balance", "SPA-ритуал", 5500, 120],
    ["sv_forma_1", "org_forma", "Стрижка и укладка", 4200, 90], ["sv_forma_2", "org_forma", "Укладка", 2500, 60],
  ];
  await db.batch([
    ...orgs.map((item) => db.prepare("INSERT OR IGNORE INTO organizations (id, slug, name, city, address, category, description, phone, color, active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)").bind(...item, created)),
    ...members.map((item) => db.prepare("INSERT OR IGNORE INTO staff (id, organization_id, name, role, active, work_start, work_end, created_at) VALUES (?, ?, ?, ?, 1, '10:00', '19:00', ?)").bind(...item, created)),
    ...offerings.map((item) => db.prepare("INSERT OR IGNORE INTO services (id, organization_id, name, price, duration, active, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)").bind(...item, created)),
  ]);
}

export function asMinutes(time: string) { const [hours, minutes] = time.split(":").map(Number); return hours * 60 + minutes; }
export function formatTime(minutes: number) { return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`; }

export function inTimezone(timezone:string,instant=new Date()){
 const parts=new Intl.DateTimeFormat("en-CA",{timeZone:timezone,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(instant);
 const value=(type:string)=>parts.find(part=>part.type===type)?.value??"00";
 return{date:`${value("year")}-${value("month")}-${value("day")}`,minutes:Number(value("hour"))*60+Number(value("minute"))};
}

export function weekday(date:string){const day=new Date(`${date}T12:00:00Z`).getUTCDay();return day===0?7:day}
export function validDate(date:string){if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return false;const parsed=new Date(`${date}T12:00:00Z`);return !Number.isNaN(parsed.getTime())&&parsed.toISOString().slice(0,10)===date}
export function normalizePhone(value:string){let digits=value.replace(/\D/g,"");if(digits.length===11&&digits[0]==="8")digits=`7${digits.slice(1)}`;return digits}

export async function sha256(value:string){const bytes=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));return Array.from(new Uint8Array(bytes)).map(byte=>byte.toString(16).padStart(2,"0")).join("")}

export async function resolveSchedule(member:Record<string,any>,date:string){
 const db=database(),exception=await db.prepare("SELECT * FROM schedule_exceptions WHERE staff_id=? AND exception_date=?").bind(member.id,date).first<Record<string,any>>();
 if(exception){if(exception.is_day_off)return null;return{start:exception.work_start||member.work_start,end:exception.work_end||member.work_end}}
 const allowed=String(member.work_days??"1,2,3,4,5,6").split(",").map(Number);if(!allowed.includes(weekday(date)))return null;
 return{start:member.work_start,end:member.work_end};
}

export async function staffCanServe(staffId:string,serviceId:string){
 const db=database(),assigned=await db.prepare("SELECT COUNT(*) AS count FROM staff_services WHERE staff_id=?").bind(staffId).first<{count:number}>();
 if(!assigned?.count)return true;
 return Boolean(await db.prepare("SELECT id FROM staff_services WHERE staff_id=? AND service_id=?").bind(staffId,serviceId).first());
}
