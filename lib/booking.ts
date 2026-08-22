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
