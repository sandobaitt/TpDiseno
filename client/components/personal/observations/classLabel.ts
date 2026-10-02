import { scheduleMock } from "@/data/schedule";
import { getActivityName } from "@/data/activities";
import { branchName } from "@/components/cronograma/weekView";
import { formatDate } from "@/lib/dates";

/** "Yoga · Centro · 02/10/2026 18:00" para mostrar a qué clase se refiere una observación. */
export function observationClassLabel(
  slotId?: string,
  date?: string,
): string | undefined {
  const slot = scheduleMock.find((s) => s.id === slotId);
  if (!slot) return undefined;
  return `${getActivityName(slot.activityId)} · ${branchName(slot.branchId)}${date ? ` · ${formatDate(date)} ${slot.start}` : ""}`;
}
