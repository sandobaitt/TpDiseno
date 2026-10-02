import { useParams } from "react-router-dom";
import { StudentProfile } from "@/components/alumnos/profile/StudentProfile";

export default function SecretariaAlumnoPage() {
  const { clientId = "" } = useParams();
  return <StudentProfile clientId={clientId} basePath="/secretaria/alumnos" />;
}
