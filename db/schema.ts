import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(), slug: text("slug").notNull().unique(), name: text("name").notNull(),
  city: text("city").notNull(), address: text("address").notNull(), category: text("category").notNull(),
  description: text("description").notNull().default(""), phone: text("phone").notNull().default(""),
  color: text("color").notNull().default("#f6e7e2"), active: integer("active").notNull().default(1),
  telegramChatId: text("telegram_chat_id").notNull().default(""), notificationsEnabled: integer("notifications_enabled").notNull().default(0),
  bloomDiscountPercent: integer("bloom_discount_percent").notNull().default(0), timezone: text("timezone").notNull().default("Asia/Novosibirsk"),
  createdAt: text("created_at").notNull(),
});

export const staff = sqliteTable("staff", {
  id: text("id").primaryKey(), organizationId: text("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(), role: text("role").notNull(), active: integer("active").notNull().default(1),
  workStart: text("work_start").notNull().default("10:00"), workEnd: text("work_end").notNull().default("19:00"),
  createdAt: text("created_at").notNull(),
});

export const services = sqliteTable("services", {
  id: text("id").primaryKey(), organizationId: text("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(), price: integer("price").notNull(), duration: integer("duration").notNull(),
  active: integer("active").notNull().default(1), createdAt: text("created_at").notNull(),
});

export const appointments = sqliteTable("appointments", {
  id: text("id").primaryKey(), organizationId: text("organization_id").notNull().references(() => organizations.id),
  staffId: text("staff_id").notNull().references(() => staff.id), serviceId: text("service_id").notNull().references(() => services.id),
  customerName: text("customer_name").notNull(), customerPhone: text("customer_phone").notNull(),
  appointmentDate: text("appointment_date").notNull(), appointmentTime: text("appointment_time").notNull(),
  duration: integer("duration").notNull(), price: integer("price").notNull(), status: text("status").notNull().default("confirmed"),
  source: text("source").notNull().default("bloom"), notes: text("notes").notNull().default(""), createdAt: text("created_at").notNull(),
}, (table) => [uniqueIndex("appointment_staff_slot_unique").on(table.staffId, table.appointmentDate, table.appointmentTime)]);

export const accountAccess = sqliteTable("account_access", {
 id:text("id").primaryKey(), email:text("email").notNull().unique(), displayName:text("display_name").notNull().default(""),
 role:text("role").notNull().default("partner"), organizationId:text("organization_id").references(()=>organizations.id),
 active:integer("active").notNull().default(1), createdAt:text("created_at").notNull(),
});

export const notificationEvents = sqliteTable("notification_events", {
 id:text("id").primaryKey(), organizationId:text("organization_id").notNull().references(()=>organizations.id),
 appointmentId:text("appointment_id").references(()=>appointments.id), channel:text("channel").notNull().default("telegram"),
 eventType:text("event_type").notNull(), status:text("status").notNull(), detail:text("detail").notNull().default(""),
 createdAt:text("created_at").notNull(),
});
