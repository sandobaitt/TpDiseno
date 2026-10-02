import * as React from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { SegmentedTabs } from "@/components/common/SegmentedTabs";
import { branchesMock } from "@/data/branches";
import { getMockSession } from "@/data/users";
import { ShiftRegister } from "./ShiftRegister";
import { TeacherAttendanceBoard } from "./TeacherAttendanceBoard";

type TabId = "semana" | "registrar";

/** Asistencia docente del encargado: consultar, confirmar o corregir (CU 2 y 3) y registrar (CU 1). */
export function ManagerAttendance() {
  const branchId = getMockSession()?.branchId ?? branchesMock[0].id;
  const branch = branchesMock.find((b) => b.id === branchId);
  const [tab, setTab] = React.useState<TabId>("semana");
  return (
    <div className="flex flex-col gap-5 px-7 pb-7 max-sm:px-4">
      <PageHeader
        title="Asistencia de profesores"
        subtitle={`${branch?.name ?? "Tu sede"}: lo programado contra lo registrado. Confirmá o corregí cada turno.`}
      />
      <SegmentedTabs<TabId>
        label="Asistencia de profesores"
        value={tab}
        onChange={setTab}
        items={[
          {
            id: "semana",
            label: "Semana de la sede",
            icon: "ti-calendar-week",
          },
          { id: "registrar", label: "Registrar turnos", icon: "ti-user-check" },
        ]}
      />
      {tab === "semana" ? (
        <TeacherAttendanceBoard canManage branchId={branchId} />
      ) : (
        <ShiftRegister branchId={branchId} />
      )}
    </div>
  );
}
