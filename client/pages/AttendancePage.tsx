import * as React from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { SegmentedTabs } from "@/components/common/SegmentedTabs";
import { SecretaryAttendance } from "@/components/alumnos/attendance/SecretaryAttendance";
import { StaffAttendanceToday } from "@/components/personal/StaffAttendanceToday";

type TabId = "students" | "staff";

export default function AttendancePage() {
  const [tab, setTab] = React.useState<TabId>("students");
  return (
    <div className="flex flex-col gap-5 px-7 pb-7 max-sm:px-4">
      <PageHeader
        title="Control de asistencia"
        subtitle="Asistencia por clase y sede. Los alumnos bloqueados no se pueden marcar presentes."
      />
      <SegmentedTabs<TabId>
        label="Lista de asistencia"
        value={tab}
        onChange={setTab}
        items={[
          { id: "students", label: "Alumnos por clase", icon: "ti-users" },
          { id: "staff", label: "Personal", icon: "ti-user-star" },
        ]}
      />
      {tab === "students" ? <SecretaryAttendance /> : <StaffAttendanceToday />}
    </div>
  );
}
