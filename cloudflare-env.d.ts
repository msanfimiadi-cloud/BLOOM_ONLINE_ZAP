type D1Database = any;
type Fetcher = {fetch(request: Request): Promise<Response>};

declare module "cloudflare:workers" {
 export const env: {DB?: D1Database; [key:string]:unknown};
}
