import * as React from "react";
import { NovedadesSidebar } from "@/components/novedades/NovedadesSidebar";
import { NovedadesHistory } from "@/components/novedades/NovedadesHistory";
import { ObservacionesList } from "@/components/novedades/ObservacionesList";
import { novedadesMock, type Novedad } from "@/data/novedades";
import { bitacorasMock } from "@/data/bitacoras";
import { getMockSession } from "@/data/users";

export default function NovedadesPage() {
  const [novedades, setNovedades] = React.useState<Novedad[]>(novedadesMock);
  const session = React.useMemo(() => getMockSession(), []);
  const isAdmin = session?.role === "admin";

  function handleAdd(novedad: Novedad) {
    setNovedades((prev) => [novedad, ...prev]);
  }

  function handleResolve(id: string) {
    setNovedades((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "resolved" } : n)),
    );
  }

  function handleDelete(id: string) {
    setNovedades((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="px-7 pb-7 max-sm:px-4 flex flex-col gap-8">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <NovedadesSidebar onAdd={handleAdd} />
        <NovedadesHistory novedades={novedades} onResolve={handleResolve} onDelete={handleDelete} />
      </div>
      {isAdmin && (
        <div className="bg-app-card/40 border border-app-border/[0.12]/30 rounded-2xl px-6 py-5">
          <ObservacionesList bitacoras={bitacorasMock} />
        </div>
      )}
    </div>
  );
}
