import * as React from "react";
import { NovedadesSidebar } from "@/components/novedades/NovedadesSidebar";
import { NovedadesHistory } from "@/components/novedades/NovedadesHistory";
import { novedadesMock, type Novedad } from "@/data/novedades";

export default function NovedadesPage() {
  const [novedades, setNovedades] = React.useState<Novedad[]>(novedadesMock);

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
    <div className="px-7 pb-7 max-sm:px-4">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <NovedadesSidebar onAdd={handleAdd} />
          <NovedadesHistory novedades={novedades} onResolve={handleResolve} onDelete={handleDelete} />
        </div>
      </div>
  );
}
