import * as React from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { SegmentedTabs } from "@/components/common/SegmentedTabs";
import { SecretaryAttendance } from "@/components/alumnos/attendance/SecretaryAttendance";
import { ShiftRegister } from "@/components/personal/attendance/ShiftRegister";
import { branchesMock } from "@/data/branches";
import { getMockSession } from "@/data/users";

type TabId = "students" | "teachers";

export default function AttendancePage() {
  const [tab, setTab] = React.useState<TabId>("students");
  return (
    <div className="flex flex-col gap-5 px-7 pb-7 max-sm:px-4">
      <PageHeader
        title="Control de asistencia"
        subtitle="Asistencia de alumnos por clase y de profesores por turno."
      />
      <SegmentedTabs<TabId>
        label="Lista de asistencia"
        value={tab}
        onChange={setTab}
        items={[
          { id: "students", label: "Alumnos por clase", icon: "ti-users" },
          { id: "teachers", label: "Profesores", icon: "ti-user-star" },
        ]}
      />
      {tab === "students" ? (
        <SecretaryAttendance />
      ) : (
        <ShiftRegister
          branchId={getMockSession()?.branchId ?? branchesMock[0].id}
          allowBranchChange
        />
      )}
    </div>
  );
}
