import { MyAccount } from "@/components/alumnos/student/MyAccount";
import { getMockSession } from "@/data/users";

export default function AlumnoPagosPage() {
  return <MyAccount clientId={getMockSession()?.clientId} />;
}
