import Database from "better-sqlite3";
import {mkdirSync,readdirSync,readFileSync} from "node:fs";
import {dirname,resolve} from "node:path";

const file=resolve(process.env.DATABASE_PATH||"./data/bloom-online.sqlite");
mkdirSync(dirname(file),{recursive:true});
const db=new Database(file);
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");
db.exec("CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)");
const applied=new Set(db.prepare("SELECT name FROM _migrations").all().map(row=>row.name));
const migrate=db.transaction((name,sql)=>{db.exec(sql.replaceAll("--> statement-breakpoint","\n"));db.prepare("INSERT INTO _migrations (name,applied_at) VALUES (?,?)").run(name,new Date().toISOString())});
for(const name of readdirSync(new URL("../drizzle/",import.meta.url)).filter(name=>name.endsWith(".sql")).sort()){
 if(applied.has(name))continue;
 migrate(name,readFileSync(new URL(`../drizzle/${name}`,import.meta.url),"utf8"));
 console.log(`Applied ${name}`);
}
db.close();
