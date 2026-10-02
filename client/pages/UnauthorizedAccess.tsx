import { Link } from "react-router-dom";
import { getMockSession, getPostLoginPath } from "@/data/users";

/** Se muestra si no hay sesión, o si el rol no tiene permiso para la ruta pedida. */
export default function UnauthorizedAccess() {
  const session = getMockSession();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 px-6">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <div className="w-20 h-20 rounded-2xl bg-red-950/30 flex items-center justify-center">
          <i
            className="ti ti-shield-lock text-4xl text-red-400"
            aria-hidden="true"
          />
        </div>
        <h1 className="text-white text-3xl font-extrabold">
          {session ? "No tenés permiso" : "Necesitás iniciar sesión"}
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          {session
            ? "Esta sección no corresponde a tu rol. Volvé a tu inicio para seguir trabajando."
            : "Ingresá con tu usuario para acceder a esta sección."}
        </p>
        <Link
          to={session ? getPostLoginPath(session.role) : "/login"}
          className="px-6 py-3 rounded-xl bg-lime-400 text-black text-sm font-extrabold hover:brightness-110 transition-all"
        >
          {session ? "Ir a mi inicio" : "Iniciar sesión"}
        </Link>
      </div>
    </div>
  );
}
