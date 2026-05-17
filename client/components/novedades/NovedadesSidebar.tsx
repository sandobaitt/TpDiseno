import * as React from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { teachersMock } from "@/data/teachers";
import { weekMock } from "@/data/schedule";

type EventTypeValue = "incident" | "change" | "normal";

const EVENT_TYPES = [
  { value: "incident" as EventTypeValue, label: "Incidente", icon: "ti-alert-triangle", color: "text-red-400", bg: "bg-red-500/10" },
  { value: "change" as EventTypeValue, label: "Cambio de turno", icon: "ti-arrows-exchange", color: "text-amber-400", bg: "bg-amber-500/10" },
  { value: "normal" as EventTypeValue, label: "Novedad general", icon: "ti-info-circle", color: "text-blue-400", bg: "bg-blue-500/10" },
];

interface Suggestion {
  id: string;
  label: string;
  sublabel: string;
  entityType: "profesor" | "clase";
}

const ALL_SUGGESTIONS: Suggestion[] = [
  ...teachersMock
    .filter((t) => t.status === "active")
    .map((t) => ({
      id: t.id,
      label: t.fullName,
      sublabel: t.specialties.slice(0, 2).join(" · "),
      entityType: "profesor" as const,
    })),
  ...Array.from(
    new Map(weekMock.flatMap((d) => d.classes).map((c) => [c.title, c])).values(),
  ).map((c) => ({
    id: c.id,
    label: c.title,
    sublabel: c.coach,
    entityType: "clase" as const,
  })),
];

export function NovedadesSidebar() {
  const [eventType, setEventType] = React.useState<EventTypeValue | "">("");
  const [eventTypeOpen, setEventTypeOpen] = React.useState(false);
  const eventTypeRef = React.useRef<HTMLDivElement>(null);

  const [assignQuery, setAssignQuery] = React.useState("");
  const [assignFocused, setAssignFocused] = React.useState(false);
  const [assignSelected, setAssignSelected] = React.useState<Suggestion | null>(null);
  const assignRef = React.useRef<HTMLDivElement>(null);

  const [timestamp, setTimestamp] = React.useState("");
  const [detail, setDetail] = React.useState("");

  React.useEffect(() => {
    if (!eventTypeOpen) return;
    const handler = (e: MouseEvent) => {
      if (eventTypeRef.current && !eventTypeRef.current.contains(e.target as Node))
        setEventTypeOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [eventTypeOpen]);

  React.useEffect(() => {
    if (!assignFocused) return;
    const handler = (e: MouseEvent) => {
      if (assignRef.current && !assignRef.current.contains(e.target as Node))
        setAssignFocused(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [assignFocused]);

  const filteredSuggestions = React.useMemo(() => {
    const q = assignQuery.toLowerCase().trim();
    if (!q) return ALL_SUGGESTIONS;
    return ALL_SUGGESTIONS.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.sublabel.toLowerCase().includes(q),
    );
  }, [assignQuery]);

  const profesores = filteredSuggestions.filter((s) => s.entityType === "profesor");
  const clases = filteredSuggestions.filter((s) => s.entityType === "clase");

  const selectedEventType = EVENT_TYPES.find((e) => e.value === eventType);
  const canSubmit = eventType !== "" && assignSelected !== null && timestamp !== "" && detail.trim() !== "";

  function handleSubmit() {
    if (!canSubmit) return;
    toast.success("Novedad registrada y notificaciones enviadas.");
    setEventType("");
    setAssignSelected(null);
    setAssignQuery("");
    setTimestamp("");
    setDetail("");
  }

  function selectAssign(s: Suggestion) {
    setAssignSelected(s);
    setAssignQuery("");
    setAssignFocused(false);
  }

  return (
    <aside className="w-full lg:w-[25%] shrink-0">
      <div className="bg-[#151515] rounded-2xl p-6 md:p-8 flex flex-col gap-6 h-full shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lime-400/10 flex items-center justify-center">
            <i className="ti ti-circle-plus text-xl text-lime-400" />
          </div>
          <h2 className="text-white font-extrabold text-sm tracking-[0.15em]">
            REGISTRAR NOVEDAD
          </h2>
        </div>

        <div className="flex flex-col gap-5">

          {/* Tipo de evento */}
          <div className="flex flex-col gap-2">
            <label className="text-gray-500 text-xs font-semibold tracking-widest">TIPO DE EVENTO</label>
            <div ref={eventTypeRef} className="relative">
              <button
                type="button"
                onClick={() => setEventTypeOpen((o) => !o)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer",
                  eventTypeOpen ? "border-lime-400/30 bg-neutral-900" : "border-zinc-800 bg-neutral-900",
                )}
              >
                {selectedEventType ? (
                  <>
                    <span className={`w-7 h-7 rounded-lg ${selectedEventType.bg} flex items-center justify-center shrink-0`}>
                      <i className={`ti ${selectedEventType.icon} text-sm ${selectedEventType.color}`} />
                    </span>
                    <span className="flex-1 text-white text-left">{selectedEventType.label}</span>
                  </>
                ) : (
                  <span className="flex-1 text-gray-500 text-left">Seleccionar categoría...</span>
                )}
                <i className={cn("ti ti-chevron-down text-gray-500 text-xs transition-transform duration-150 shrink-0", eventTypeOpen && "rotate-180")} />
              </button>

              {eventTypeOpen && (
                <div className="absolute top-full mt-1.5 left-0 right-0 z-50 rounded-xl bg-neutral-900 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden py-1 animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-100">
                  {EVENT_TYPES.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setEventType(opt.value); setEventTypeOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left",
                        eventType === opt.value
                          ? "bg-white/[0.06] text-white"
                          : "text-gray-400 hover:bg-white/[0.04] hover:text-white",
                      )}
                    >
                      <span className={`w-7 h-7 rounded-lg ${opt.bg} flex items-center justify-center shrink-0`}>
                        <i className={`ti ${opt.icon} text-sm ${opt.color}`} />
                      </span>
                      <span className="flex-1">{opt.label}</span>
                      {eventType === opt.value && <i className="ti ti-check text-lime-400 text-xs" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Asignado a */}
          <div className="flex flex-col gap-2">
            <label className="text-gray-500 text-xs font-semibold tracking-widest">ASIGNADO A</label>
            <div ref={assignRef} className="relative">
              {assignSelected ? (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-neutral-900 border border-lime-400/25">
                  <span className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                    assignSelected.entityType === "profesor" ? "bg-lime-400/10" : "bg-blue-400/10",
                  )}>
                    <i className={cn(
                      "ti text-sm",
                      assignSelected.entityType === "profesor" ? "ti-user text-lime-400" : "ti-barbell text-blue-400",
                    )} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{assignSelected.label}</p>
                    <p className="text-gray-500 text-[10px] truncate">{assignSelected.sublabel}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setAssignSelected(null); setAssignQuery(""); }}
                    className="text-gray-600 hover:text-gray-300 transition-colors cursor-pointer shrink-0"
                  >
                    <i className="ti ti-x text-xs" />
                  </button>
                </div>
              ) : (
                <div className={cn(
                  "relative flex items-center rounded-xl border bg-neutral-900 transition-all",
                  assignFocused ? "border-lime-400/30" : "border-zinc-800",
                )}>
                  <i className="ti ti-search absolute left-3 text-gray-600 text-sm pointer-events-none" />
                  <input
                    type="text"
                    value={assignQuery}
                    onChange={(e) => setAssignQuery(e.target.value)}
                    onFocus={() => setAssignFocused(true)}
                    placeholder="Buscar profesor o clase..."
                    className="w-full bg-transparent pl-9 pr-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none"
                  />
                </div>
              )}

              {assignFocused && !assignSelected && (
                <div className="absolute top-full mt-1.5 left-0 right-0 z-50 rounded-xl bg-neutral-900 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden max-h-[220px] overflow-y-auto animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-100">
                  {filteredSuggestions.length === 0 ? (
                    <div className="px-4 py-4 text-xs text-gray-600 text-center">Sin resultados</div>
                  ) : (
                    <>
                      {profesores.length > 0 && (
                        <>
                          <div className="px-4 py-2 text-[9px] font-bold tracking-widest text-gray-600 bg-black/20">
                            PROFESORES
                          </div>
                          {profesores.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onMouseDown={(e) => { e.preventDefault(); selectAssign(s); }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.04] transition-colors"
                            >
                              <span className="w-6 h-6 rounded-lg bg-lime-400/10 flex items-center justify-center shrink-0">
                                <i className="ti ti-user text-[10px] text-lime-400" />
                              </span>
                              <div className="min-w-0">
                                <p className="text-white text-xs font-semibold truncate">{s.label}</p>
                                <p className="text-gray-500 text-[10px] truncate">{s.sublabel}</p>
                              </div>
                            </button>
                          ))}
                        </>
                      )}
                      {clases.length > 0 && (
                        <>
                          <div className="px-4 py-2 text-[9px] font-bold tracking-widest text-gray-600 bg-black/20 border-t border-white/[0.04]">
                            CLASES
                          </div>
                          {clases.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onMouseDown={(e) => { e.preventDefault(); selectAssign(s); }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.04] transition-colors"
                            >
                              <span className="w-6 h-6 rounded-lg bg-blue-400/10 flex items-center justify-center shrink-0">
                                <i className="ti ti-barbell text-[10px] text-blue-400" />
                              </span>
                              <div className="min-w-0">
                                <p className="text-white text-xs font-semibold truncate">{s.label}</p>
                                <p className="text-gray-500 text-[10px] truncate">{s.sublabel}</p>
                              </div>
                            </button>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Fecha y hora */}
          <div className="flex flex-col gap-2">
            <label className="text-gray-500 text-xs font-semibold tracking-widest">FECHA Y HORA</label>
            <input
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-full bg-neutral-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-lime-400/40 transition-colors [color-scheme:dark]"
            />
          </div>

          {/* Detalle operativo */}
          <div className="flex flex-col gap-2">
            <label className="text-gray-500 text-xs font-semibold tracking-widest">DETALLE OPERATIVO</label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Describa el incidente o motivo de la novedad..."
              rows={4}
              className="w-full bg-neutral-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none focus:border-lime-400/40 transition-colors resize-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            "w-full py-4 rounded-xl font-extrabold text-sm tracking-wider transition-all",
            canSubmit
              ? "bg-lime-400 text-black hover:brightness-110 active:brightness-95 shadow-[0_0_20px_rgba(163,230,53,0.25)] cursor-pointer"
              : "bg-neutral-800 text-gray-600 cursor-not-allowed",
          )}
        >
          <span className="flex items-center justify-center gap-2">
            <i className="ti ti-bell-ringing text-base shrink-0" />
            REGISTRAR Y NOTIFICAR
          </span>
        </button>

      </div>
    </aside>
  );
}
