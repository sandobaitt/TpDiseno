import { Link } from "react-router-dom";
import { clearMockSession } from "@/data/users";

export default function AdminPanel() {
  return (
    <div className="min-h-screen bg-squat-dark flex flex-col items-center justify-center gap-4 p-6 text-white">
      <h1 className="font-jakarta text-2xl font-bold text-squat-green">Panel administrador</h1>
      <p className="font-inter text-sm text-squat-muted text-center max-w-md">
        Vista mock. Aquí irá la administración del gimnasio.
      </p>
      <Link
        to="/login"
        onClick={() => clearMockSession()}
        className="rounded-[6px] bg-squat-green px-6 py-3 font-jakarta font-bold text-squat-ink hover:brightness-105 transition-all"
      >
        Cerrar sesión
      </Link>
    </div>
  );
}
