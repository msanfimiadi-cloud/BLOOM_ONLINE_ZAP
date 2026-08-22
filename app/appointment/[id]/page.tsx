import ManageAppointment from "./manage-appointment";
export default async function AppointmentPage({params}:{params:Promise<{id:string}>}){const{id}=await params;return<ManageAppointment id={id}/>}
