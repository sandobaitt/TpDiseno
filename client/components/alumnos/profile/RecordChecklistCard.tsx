import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge, type StatusTone } from "@/components/common/StatusBadge";
import type { RecordChecklistItem } from "@/domain/enrollment";

const STYLE: Record<
  RecordChecklistItem["state"],
  { tone: StatusTone; icon: string }
> = {
  ok: { tone: "success", icon: "ti-circle-check" },
  pending: { tone: "warning", icon: "ti-clock" },
  missing: { tone: "danger", icon: "ti-alert-circle" },
};

interface RecordChecklistCardProps {
  items: RecordChecklistItem[];
  onOpenHealth: () => void;
}

/** Legajo de un vistazo: DDJJ, certificado y autorización del menor. */
export function RecordChecklistCard({
  items,
  onOpenHealth,
}: RecordChecklistCardProps) {
  return (
    <SectionCard
      title="Legajo"
      icon="ti-folder"
      actions={
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={onOpenHealth}
          className="h-auto px-0"
        >
          Ver salud y documentos
        </Button>
      }
    >
      <ul className="flex flex-col gap-2">
        {items.map((item) => {
          // Lo opcional que falta (el certificado) no se marca como problema.
          const style =
            item.state === "missing" && !item.required
              ? { tone: "neutral" as const, icon: "ti-minus" }
              : STYLE[item.state];
          return (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-neutral-800/40 px-4 py-3"
            >
              <span className="text-sm text-white">{item.label}</span>
              <StatusBadge tone={style.tone} icon={style.icon}>
                {item.detail}
              </StatusBadge>
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}
