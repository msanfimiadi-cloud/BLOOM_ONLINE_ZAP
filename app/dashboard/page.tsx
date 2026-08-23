import {requireAuthenticatedUser} from "@/app/auth";
import Dashboard from "./dashboard-client";

export const dynamic="force-dynamic";
export default async function DashboardPage(){await requireAuthenticatedUser("/dashboard");return <Dashboard/>}
