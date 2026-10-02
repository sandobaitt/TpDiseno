import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import type { Communication } from "@/data/communications";
import { getUserName } from "@/data/users";
import { formatDateTime } from "@/lib/dates";
import { useAppState } from "@/store/StoreProvider";

/** Historial de comunicaciones enviadas, con sus destinatarios (CU 14). */
export function MessageHistory() {
  const state = useAppState();
  const [selected, setSelected] = React.useState<Communication | null>(null);
  const messages = [...state.communications].sort((a, b) =>
    b.sentAt.localeCompare(a.sentAt),
  );
  const nameOf = (id: string) =>
    state.clients.find((c) => c.id === id)?.fullName ?? "Alumno";

  return (
    <SectionCard title="Enviadas" icon="ti-history">
      {messages.length === 0 ? (
        <EmptyState
          icon="ti-message-off"
          title="Todavía no se enviaron comunicaciones"
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {messages.map((m) => (
            <li key={m.id}>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelected(m)}
                className="h-auto w-full flex-col items-start gap-0.5 whitespace-normal rounded-xl border border-white/[0.06] bg-neutral-800/40 px-4 py-3 text-left font-normal"
              >
                <span className="text-sm font-bold text-white">
                  {m.subject}
                </span>
                <span className="text-xs text-gray-300">
                  {m.audienceLabel} · {m.recipientIds.length}{" "}
                  {m.recipientIds.length === 1 ? "alumno" : "alumnos"}
                  {m.byEmail && " · app y email"}
                </span>
                <span className="text-xs text-gray-400">
                  {getUserName(m.sentBy)} · {formatDateTime(m.sentAt)}
                </span>
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-2xl border-white/[0.08] bg-neutral-900 text-white">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-extrabold">
                  {selected.subject}
                </DialogTitle>
                <DialogDescription>
                  {getUserName(selected.sentBy)} ·{" "}
                  {formatDateTime(selected.sentAt)} ·{" "}
                  {selected.byEmail ? "app y email" : "solo app"}
                </DialogDescription>
              </DialogHeader>
              <p className="rounded-xl bg-neutral-800/50 p-4 text-sm text-gray-200">
                {selected.body}
              </p>
              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground">
                  Destinatarios ({selected.audienceLabel}):{" "}
                  {selected.recipientIds.length}
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {selected.recipientIds.map((id) => (
                    <li
                      key={id}
                      className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-gray-300"
                    >
                      {nameOf(id)}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </SectionCard>
  );
}
