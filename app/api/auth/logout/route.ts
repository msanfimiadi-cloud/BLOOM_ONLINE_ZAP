import {deleteSession} from "@/app/auth";
export async function POST(){await deleteSession();return Response.json({success:true})}
