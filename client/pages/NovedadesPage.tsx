import { NovedadesSidebar } from "@/components/novedades/NovedadesSidebar";
import { NovedadesHistory } from "@/components/novedades/NovedadesHistory";
import { novedadesMock } from "@/data/novedades";

export default function NovedadesPage() {
  return (
    <div className="px-7 pb-7 max-sm:px-4">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <NovedadesSidebar />
          <NovedadesHistory novedades={novedadesMock} />
        </div>
      </div>
  );
}
