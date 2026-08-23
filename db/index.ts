import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import {mkdirSync} from "node:fs";
import {dirname,resolve} from "node:path";
import * as schema from "./schema";

export function getDb() {
  const file=resolve(/* turbopackIgnore: true */ process.env.DATABASE_PATH||"./data/bloom-online.sqlite");
  mkdirSync(dirname(file),{recursive:true});
  return drizzle(new Database(file), { schema });
}
