import Database from "better-sqlite3";
import {mkdirSync} from "node:fs";
import {resolve} from "node:path";
const source=resolve(process.env.DATABASE_PATH||"./data/bloom-online.sqlite"),directory=resolve(process.env.BACKUP_DIR||"./backups");
mkdirSync(directory,{recursive:true});
const stamp=new Date().toISOString().replaceAll(":","-").replaceAll(".","-");
const target=resolve(directory,`bloom-online-${stamp}.sqlite`),db=new Database(source,{readonly:true});
await db.backup(target);db.close();console.log(target);
