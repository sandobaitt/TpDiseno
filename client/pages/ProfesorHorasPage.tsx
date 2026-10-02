import { MyHours } from "@/components/personal/hours/MyHours";
import { getMockSession } from "@/data/users";

export default function ProfesorHorasPage() {
  return <MyHours teacherId={getMockSession()?.teacherId} />;
}
