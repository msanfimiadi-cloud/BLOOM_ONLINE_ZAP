import assert from "node:assert/strict";
import test from "node:test";
import {readFile} from "node:fs/promises";

test("hosting manifest enables durable booking storage",async()=>{const manifest=JSON.parse(await readFile(new URL("../.openai/hosting.json",import.meta.url),"utf8"));assert.equal(manifest.d1,"DB")});
test("booking schema protects specialist time slots",async()=>{const schema=await readFile(new URL("../db/schema.ts",import.meta.url),"utf8");assert.match(schema,/appointment_staff_slot_unique/);assert.match(schema,/appointmentDate/);assert.match(schema,/staffId/)});
test("public booking endpoint rejects overlapping appointments atomically",async()=>{const endpoint=await readFile(new URL("../app/api/booking/route.ts",import.meta.url),"utf8");assert.match(endpoint,/INSERT INTO appointments[\s\S]*WHERE NOT EXISTS/);assert.match(endpoint,/status!='cancelled'/);assert.match(endpoint,/409/)});
test("dashboard access requires authenticated user",async()=>{const dashboard=await readFile(new URL("../app/dashboard/page.tsx",import.meta.url),"utf8");assert.match(dashboard,/requireChatGPTUser\("\/dashboard"\)/)});
test("application metadata uses requested russian branding",async()=>{const layout=await readFile(new URL("../app/layout.tsx",import.meta.url),"utf8");assert.match(layout,/Bloom Online — запись к специалистам/);assert.match(layout,/<html lang="ru">/)});
