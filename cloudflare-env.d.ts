type D1Database = any;
type Fetcher = {fetch(request: Request): Promise<Response>};

declare module "cloudflare:workers" {
 export const env: {DB?: D1Database; TELEGRAM_BOT_TOKEN?:string; APP_BASE_URL?:string; OWNER_EMAIL?:string; [key:string]:unknown};
}
