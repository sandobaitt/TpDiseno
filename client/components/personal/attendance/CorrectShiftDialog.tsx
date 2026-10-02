import * as React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormField, inputClasses } from "@/components/common/FormField";
import { getActivityName } from "@/data/activities";
import { getTeacher } from "@/data/teachers";
import { getMockSession } from "@/data/users";
import type { TeacherAttendanceStatus } from "@/data/teacherAttendance";
import { ABSENCE_REASONS, type ShiftRow } from "@/domain/teacherAttendance";
import { formatDateLong, nowISO } from "@/lib/dates";
import { cleanText } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useStoreActions } from "@/store/StoreProvider";

interface CorrectShiftDialogProps {
  /** Turno a corregir (con registro) o a registrar (sin registro). */
  row: ShiftRow | null;
  onClose: () => void;
}

/**
 * Corregir o completar la asistencia de un profesor (CU 3 de Personal). La
 * corrección pide motivo y queda el valor anterior; lo que registra el
 * encargado queda confirmado.
 */
export function CorrectShiftDialog({ row, onClose }: CorrectShiftDialogProps) {
  const actions = useStoreActions();
  const id = React.useId();
  const [status, setStatus] =
    React.useState<TeacherAttendanceStatus>("present");
  const [absence, setAbsence] = React.useState(ABSENCE_REASONS[0]);
  const [reason, setReason] = React.useState("");
  const [error, setError] = React.useState<string>();
  const isCorrection = !!row?.record;

  React.useEffect(() => {
    if (row) {
      setStatus(row.record?.status === "present" ? "absent" : "present");
      setAbsence(ABSENCE_REASONS[0]);
      setReason("");
      setError(undefined);
    }
  }, [row]);

  if (!row) return null;
  const teacher = getTeacher(row.session.teacherId);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!row) return;
    if (isCorrection) {
      if (cleanText(reason).length < 3) {
        setError(
          "Contá por qué se corrige (por ejemplo, «llegó tarde pero dio la clase»).",
        );
        return;
      }
      actions.correctTeacherAttendance(
        row.record!.id,
        status,
        cleanText(reason),
      );
      toast.success(
        "Asistencia corregida. Queda el valor anterior y el motivo.",
      );
    } else {
      const recordId = `ta_${row.session.slotId}_${row.session.date}`;
      actions.saveTeacherAttendance(
        [
          {
            id: recordId,
            slotId: row.session.slotId,
            date: row.session.date,
            teacherId: row.session.teacherId,
            status,
            reason: status === "absent" ? absence : undefined,
            recordedBy: getMockSession()?.id ?? "sistema",
            recordedAt: nowISO(),
          },
        ],
        row.session.date,
      );
      actions.confirmTeacherAttendance(recordId);
      toast.success("Asistencia registrada y confirmada.");
    }
    onClose();
  }

  return (
    <Dialog open={!!row} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-2xl border-white/[0.08] bg-neutral-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold">
            {isCorrection ? "Corregir asistencia" : "Registrar asistencia"}
          </DialogTitle>
          <DialogDescription>
            {teacher?.fullName ?? "Profesor"} ·{" "}
            {getActivityName(row.session.activityId)} del{" "}
            {formatDateLong(row.session.date)} a las {row.session.start}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4"
        >
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-xs font-semibold text-gray-300">
              ¿Dio la clase?
            </legend>
            <RadioGroup
              value={status}
              onValueChange={(v) => setStatus(v as TeacherAttendanceStatus)}
              className="grid grid-cols-2 gap-2"
            >
              {(["present", "absent"] as TeacherAttendanceStatus[]).map(
                (value) => (
                  <label
                    key={value}
                    htmlFor={`${id}-${value}`}
                    className={cn(
                      "flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm",
                      status === value
                        ? "border-primary/60 bg-primary/10 text-white"
                        : "border-zinc-700 text-gray-300",
                    )}
                  >
                    <RadioGroupItem
                      id={`${id}-${value}`}
                      value={value}
                      className="h-5 w-5"
                    />
                    {value === "present" ? "Presente" : "Ausente"}
                  </label>
                ),
              )}
            </RadioGroup>
          </fieldset>
          {!isCorrection && status === "absent" && (
            <FormField label="Motivo de la ausencia">
              {(fieldId) => (
                <select
                  id={fieldId}
                  value={absence}
                  onChange={(e) => setAbsence(e.target.value)}
                  className={inputClasses}
                >
                  {ABSENCE_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              )}
            </FormField>
          )}
          {isCorrection && (
            <FormField label="Motivo de la corrección" required error={error}>
              {(fieldId, describedBy) => (
                <textarea
                  id={fieldId}
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setError(undefined);
                  }}
                  rows={2}
                  aria-invalid={!!error}
                  aria-describedby={describedBy}
                  className={cn(inputClasses, "resize-y")}
                />
              )}
            </FormField>
          )}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button type="submit" className="rounded-xl font-bold">
              {isCorrection ? "Guardar corrección" : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
