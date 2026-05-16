import { Link } from "react-router-dom";

export default function UnauthorizedAccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 px-6">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <div className="w-20 h-20 rounded-2xl bg-red-950/30 flex items-center justify-center">
          <i className="ti ti-shield-lock text-4xl text-red-400" />
        </div>
        <h1 className="text-white text-3xl font-extrabold">
          Acceso No Autorizado
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Debes iniciar sesión para acceder a esta sección.
        </p>
        <Link
          to="/login"
          className="px-6 py-3 rounded-xl bg-lime-400 text-black text-sm font-extrabold hover:brightness-110 transition-all"
        >
          Iniciar Sesión
        </Link>
      </div>
    </div>
  );
}
