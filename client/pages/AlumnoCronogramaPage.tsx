import { MyPlanSchedule } from "@/components/alumnos/student/MyPlanSchedule";
import { getMockSession } from "@/data/users";

export default function AlumnoCronogramaPage() {
  return <MyPlanSchedule clientId={getMockSession()?.clientId} />;
}
