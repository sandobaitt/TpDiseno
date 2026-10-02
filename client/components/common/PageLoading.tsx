/** Mientras se descarga una pantalla (carga diferida por rol). */
export function PageLoading() {
  return (
    <div
      role="status"
      className="flex flex-1 items-center justify-center gap-3 py-24 text-sm text-gray-300"
    >
      <i
        className="ti ti-loader-2 animate-spin text-2xl text-primary"
        aria-hidden="true"
      />
      Cargando…
    </div>
  );
}
