import {requireChatGPTUser} from "@/app/chatgpt-auth";
import Dashboard from "./dashboard-client";

export const dynamic="force-dynamic";
export default async function DashboardPage(){await requireChatGPTUser("/dashboard");return <Dashboard/>}
