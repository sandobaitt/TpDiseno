import * as React from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { teachersMock } from "@/data/teachers";
import { weekMock } from "@/data/schedule";
import type { Novedad } from "@/data/novedades";

/* ── helpers ── */
const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS_ES   = ["LU","MA","MI","JU","VI","SA","DO"];
const HOURS     = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES   = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

/* ── DatePicker ── */
function DatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const today = new Date();
  const selected = value ? new Date(value + "T00:00:00") : null;
  const [viewYear,  setViewYear]  = React.useState(selected?.getFullYear()  ?? today.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(selected?.getMonth()     ?? today.getMonth());

  React.useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  /* build grid: Mon-first */
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const blanks   = firstDow === 0 ? 6 : firstDow - 1;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(blanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }
  function selectDay(day: number) {
    const d  = new Date(viewYear, viewMonth, day);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    onChange(`${d.getFullYear()}-${mm}-${dd}`);
    setOpen(false);
  }
  function goToday() {
    const t = new Date();
    setViewYear(t.getFullYear());
    setViewMonth(t.getMonth());
    selectDay(t.getDate());
  }

  const displayValue = selected
    ? selected.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-app-bg border text-sm transition-all cursor-pointer",
          open ? "border-lime-400/30" : "border-app-border/[0.12] hover:border-app-input-border",
        )}
      >
        <i className="ti ti-calendar text-app-faint text-sm shrink-0" />
        <span className={cn("flex-1 text-left", displayValue ? "text-app-text" : "text-app-faint")}>
          {displayValue ?? "dd/mm/aaaa"}
        </span>
        <i className={cn("ti ti-chevron-down text-app-faint text-xs transition-transform duration-150", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full mt-1.5 left-0 right-0 z-50 rounded-xl bg-app-bg border border-app-border/[0.08] shadow-dropdown p-4 animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-100">
          {/* nav */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-app-hover/[0.06] text-app-subtle hover:text-app-text transition-colors cursor-pointer">
              <i className="ti ti-chevron-left text-xs" />
            </button>
            <span className="text-app-text text-xs font-bold tracking-wider">
              {MONTHS_ES[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-app-hover/[0.06] text-app-subtle hover:text-app-text transition-colors cursor-pointer">
              <i className="ti ti-chevron-right text-xs" />
            </button>
          </div>

          {/* day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS_ES.map(d => (
              <span key={d} className="text-center text-[9px] font-bold tracking-wider text-app-faint py-1">{d}</span>
            ))}
          </div>

          {/* day cells */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((day, i) => {
              if (!day) return <div key={`b-${i}`} />;
              const isSel  = selected && selected.getDate() === day && selected.getMonth() === viewMonth && selected.getFullYear() === viewYear;
              const isToday = today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={cn(
                    "w-7 h-7 mx-auto flex items-center justify-center rounded-lg text-xs font-medium transition-all cursor-pointer",
                    isSel  ? "bg-lime-400 text-black font-extrabold" :
                    isToday ? "bg-lime-400/15 text-lime-400 font-bold" :
                    "text-app-muted hover:bg-app-hover/[0.06] hover:text-app-text",
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* footer */}
          <div className="flex justify-between mt-3 pt-3 border-t border-app-border/[0.05]">
            <button type="button" onClick={() => { onChange(""); setOpen(false); }} className="text-[10px] text-app-subtle hover:text-app-muted transition-colors cursor-pointer">
              Borrar
            </button>
            <button type="button" onClick={goToday} className="text-[10px] text-lime-400 hover:text-lime-300 transition-colors cursor-pointer font-bold">
              Hoy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── TimePicker ── */
function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const ref     = React.useRef<HTMLDivElement>(null);
  const hourRef = React.useRef<HTMLDivElement>(null);
  const minRef  = React.useRef<HTMLDivElement>(null);

  const [hour, setHour] = React.useState(value ? value.split(":")[0] : "");
  const [min,  setMin]  = React.useState(value ? value.split(":")[1] : "");

  // sync when parent resets value to ""
  React.useEffect(() => {
    setHour(value ? value.split(":")[0] : "");
    setMin(value  ? value.split(":")[1] : "");
  }, [value]);

  React.useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    setTimeout(() => {
      hourRef.current?.querySelector("[data-selected]")?.scrollIntoView({ block: "center" });
      minRef.current?.querySelector("[data-selected]")?.scrollIntoView({ block: "center" });
    }, 50);
  }, [open]);

  function selectHour(h: string) {
    setHour(h);
    if (min) onChange(`${h}:${min}`);
  }

  function selectMin(m: string) {
    setMin(m);
    if (hour) { onChange(`${hour}:${m}`); setOpen(false); }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-app-bg border text-sm transition-all cursor-pointer",
          open ? "border-lime-400/30" : "border-app-border/[0.12] hover:border-app-input-border",
        )}
      >
        <i className="ti ti-clock text-app-faint text-sm shrink-0" />
        <span className={cn("flex-1 text-left", value ? "text-app-text" : "text-app-faint")}>
          {value || "--:--"}
        </span>
        <i className={cn("ti ti-chevron-down text-app-faint text-xs transition-transform duration-150", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full mt-1.5 left-0 right-0 z-50 rounded-xl bg-app-bg border border-app-border/[0.08] shadow-dropdown p-3 animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-100">
          <div className="flex gap-2">
            {/* hours */}
            <div className="flex-1 flex flex-col gap-1">
              <span className="text-[9px] font-bold tracking-wider text-app-faint text-center">HORA</span>
              <div ref={hourRef} className="max-h-44 overflow-y-auto flex flex-col gap-0.5 scrollbar-thin pr-0.5">
                {HOURS.map(h => (
                  <button
                    key={h}
                    type="button"
                    data-selected={hour === h ? "" : undefined}
                    onClick={() => selectHour(h)}
                    className={cn(
                      "w-full py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                      hour === h ? "bg-lime-400 text-black font-extrabold" : "text-app-muted hover:bg-app-hover/[0.06] hover:text-app-text",
                    )}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-px bg-app-border/[0.06] self-stretch" />

            {/* minutes */}
            <div className="flex-1 flex flex-col gap-1">
              <span className="text-[9px] font-bold tracking-wider text-app-faint text-center">MIN</span>
              <div ref={minRef} className="max-h-44 overflow-y-auto flex flex-col gap-0.5 scrollbar-thin pr-0.5">
                {MINUTES.map(m => (
                  <button
                    key={m}
                    type="button"
                    data-selected={min === m ? "" : undefined}
                    onClick={() => selectMin(m)}
                    className={cn(
                      "w-full py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                      min === m ? "bg-lime-400 text-black font-extrabold" : "text-app-muted hover:bg-app-hover/[0.06] hover:text-app-text",
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {value && (
            <div className="mt-2 pt-2 border-t border-app-border/[0.05] text-center">
              <button type="button" onClick={() => { onChange(""); setOpen(false); }} className="text-[10px] text-app-subtle hover:text-app-muted transition-colors cursor-pointer">
                Borrar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── main data ── */
type EventTypeValue = "incident" | "change" | "normal";

const EVENT_TYPES = [
  { value: "incident" as EventTypeValue, label: "Incidente",       icon: "ti-alert-triangle",  color: "text-red-400",   bg: "bg-red-500/10"   },
  { value: "change"   as EventTypeValue, label: "Cambio de turno", icon: "ti-arrows-exchange",  color: "text-amber-400", bg: "bg-amber-500/10" },
  { value: "normal"   as EventTypeValue, label: "Novedad general", icon: "ti-info-circle",      color: "text-blue-400",  bg: "bg-blue-500/10"  },
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

interface NovedadesSidebarProps {
  onAdd?: (novedad: Novedad) => void;
}

export function NovedadesSidebar({ onAdd }: NovedadesSidebarProps) {
  const [eventType,     setEventType]     = React.useState<EventTypeValue | "">("");
  const [eventTypeOpen, setEventTypeOpen] = React.useState(false);
  const eventTypeRef = React.useRef<HTMLDivElement>(null);

  const [assignQuery,    setAssignQuery]    = React.useState("");
  const [assignFocused,  setAssignFocused]  = React.useState(false);
  const [assignSelected, setAssignSelected] = React.useState<Suggestion | null>(null);
  const assignRef = React.useRef<HTMLDivElement>(null);

  const [dateVal, setDateVal] = React.useState("");
  const [timeVal, setTimeVal] = React.useState("");
  const [detail,  setDetail]  = React.useState("");

  React.useEffect(() => {
    if (!eventTypeOpen) return;
    const h = (e: MouseEvent) => {
      if (eventTypeRef.current && !eventTypeRef.current.contains(e.target as Node))
        setEventTypeOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [eventTypeOpen]);

  React.useEffect(() => {
    if (!assignFocused) return;
    const h = (e: MouseEvent) => {
      if (assignRef.current && !assignRef.current.contains(e.target as Node))
        setAssignFocused(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [assignFocused]);

  const filteredSuggestions = React.useMemo(() => {
    const q = assignQuery.toLowerCase().trim();
    if (!q) return ALL_SUGGESTIONS;
    return ALL_SUGGESTIONS.filter(
      (s) => s.label.toLowerCase().includes(q) || s.sublabel.toLowerCase().includes(q),
    );
  }, [assignQuery]);

  const profesores = filteredSuggestions.filter((s) => s.entityType === "profesor");
  const clases     = filteredSuggestions.filter((s) => s.entityType === "clase");

  const selectedEventType = EVENT_TYPES.find((e) => e.value === eventType);
  const hasAssigned = assignSelected !== null || assignQuery.trim() !== "";
  const canSubmit   = eventType !== "" && hasAssigned && dateVal !== "" && timeVal !== "" && detail.trim() !== "";

  function handleSubmit() {
    if (!canSubmit) return;
    const entityName = assignSelected?.label ?? assignQuery.trim();
    const novedad: Novedad = {
      id: `nov_${Date.now()}`,
      type: eventType as Novedad["type"],
      entityType: assignSelected?.entityType ?? "profesor",
      entityName,
      timestamp: new Date(`${dateVal}T${timeVal}`).toISOString(),
      detail: detail.trim(),
      status: "in_progress",
    };
    onAdd?.(novedad);
    toast.success("Novedad registrada con éxito.");
    setEventType("");
    setAssignSelected(null);
    setAssignQuery("");
    setDateVal("");
    setTimeVal("");
    setDetail("");
  }

  function selectAssign(s: Suggestion) {
    setAssignSelected(s);
    setAssignQuery("");
    setAssignFocused(false);
  }

  return (
    <aside className="w-full lg:w-[25%] shrink-0">
      <div className="bg-app-elevated rounded-2xl p-6 md:p-8 flex flex-col gap-6 h-full shadow-card glass-border">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lime-400/10 flex items-center justify-center">
            <i className="ti ti-circle-plus text-xl text-lime-400" />
          </div>
          <h2 className="text-app-text font-extrabold text-sm tracking-[0.15em]">REGISTRAR NOVEDAD</h2>
        </div>

        <div className="flex flex-col gap-5">

          {/* Tipo de evento */}
          <div className="flex flex-col gap-2">
            <label className="text-app-subtle text-xs font-semibold tracking-widest">TIPO DE EVENTO</label>
            <div ref={eventTypeRef} className="relative">
              <button
                type="button"
                onClick={() => setEventTypeOpen((o) => !o)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer",
                  eventTypeOpen ? "border-lime-400/30 bg-app-bg" : "border-app-border/[0.12] bg-app-bg",
                )}
              >
                {selectedEventType ? (
                  <>
                    <span className={`w-7 h-7 rounded-lg ${selectedEventType.bg} flex items-center justify-center shrink-0`}>
                      <i className={`ti ${selectedEventType.icon} text-sm ${selectedEventType.color}`} />
                    </span>
                    <span className="flex-1 text-app-text text-left">{selectedEventType.label}</span>
                  </>
                ) : (
                  <span className="flex-1 text-app-subtle text-left">Seleccionar categoría...</span>
                )}
                <i className={cn("ti ti-chevron-down text-app-subtle text-xs transition-transform duration-150 shrink-0", eventTypeOpen && "rotate-180")} />
              </button>

              {eventTypeOpen && (
                <div className="absolute top-full mt-1.5 left-0 right-0 z-50 rounded-xl bg-app-bg border border-app-border/[0.08] shadow-dropdown overflow-hidden py-1 animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-100">
                  {EVENT_TYPES.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setEventType(opt.value); setEventTypeOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left",
                        eventType === opt.value ? "bg-app-hover/[0.06] text-app-text" : "text-app-muted hover:bg-app-hover/[0.04] hover:text-app-text",
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
            <label className="text-app-subtle text-xs font-semibold tracking-widest">ASIGNADO A</label>
            <div ref={assignRef} className="relative">
              {assignSelected ? (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-app-bg border border-lime-400/25">
                  <span className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", assignSelected.entityType === "profesor" ? "bg-lime-400/10" : "bg-blue-400/10")}>
                    <i className={cn("ti text-sm", assignSelected.entityType === "profesor" ? "ti-user text-lime-400" : "ti-barbell text-blue-400")} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-app-text text-sm font-semibold truncate">{assignSelected.label}</p>
                    <p className="text-app-subtle text-[10px] truncate">{assignSelected.sublabel}</p>
                  </div>
                  <button type="button" onClick={() => { setAssignSelected(null); setAssignQuery(""); }} className="text-app-faint hover:text-app-muted transition-colors cursor-pointer shrink-0">
                    <i className="ti ti-x text-xs" />
                  </button>
                </div>
              ) : (
                <div className={cn("relative flex items-center rounded-xl border bg-app-bg transition-all", assignFocused ? "border-lime-400/30" : "border-app-border/[0.12]")}>
                  <i className="ti ti-search absolute left-3 text-app-faint text-sm pointer-events-none" />
                  <input
                    type="text"
                    value={assignQuery}
                    onChange={(e) => setAssignQuery(e.target.value)}
                    onFocus={() => setAssignFocused(true)}
                    placeholder="Buscar profesor o clase..."
                    className="w-full bg-transparent pl-9 pr-4 py-3 text-sm text-app-text placeholder:text-app-faint outline-none"
                  />
                </div>
              )}

              {assignFocused && !assignSelected && (
                <div className="absolute top-full mt-1.5 left-0 right-0 z-50 rounded-xl bg-app-bg border border-app-border/[0.08] shadow-dropdown overflow-hidden max-h-[220px] overflow-y-auto animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-100">
                  {filteredSuggestions.length === 0 ? (
                    <div className="px-4 py-4 text-xs text-app-faint text-center">Sin resultados</div>
                  ) : (
                    <>
                      {profesores.length > 0 && (
                        <>
                          <div className="px-4 py-2 text-[9px] font-bold tracking-widest text-app-faint bg-app-surface/50">PROFESORES</div>
                          {profesores.map((s) => (
                            <button key={s.id} type="button" onMouseDown={(e) => { e.preventDefault(); selectAssign(s); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-app-hover/[0.04] transition-colors">
                              <span className="w-6 h-6 rounded-lg bg-lime-400/10 flex items-center justify-center shrink-0"><i className="ti ti-user text-[10px] text-lime-400" /></span>
                              <div className="min-w-0">
                                <p className="text-app-text text-xs font-semibold truncate">{s.label}</p>
                                <p className="text-app-subtle text-[10px] truncate">{s.sublabel}</p>
                              </div>
                            </button>
                          ))}
                        </>
                      )}
                      {clases.length > 0 && (
                        <>
                          <div className="px-4 py-2 text-[9px] font-bold tracking-widest text-app-faint bg-app-surface/50 border-t border-app-border/[0.04]">CLASES</div>
                          {clases.map((s) => (
                            <button key={s.id} type="button" onMouseDown={(e) => { e.preventDefault(); selectAssign(s); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-app-hover/[0.04] transition-colors">
                              <span className="w-6 h-6 rounded-lg bg-blue-400/10 flex items-center justify-center shrink-0"><i className="ti ti-barbell text-[10px] text-blue-400" /></span>
                              <div className="min-w-0">
                                <p className="text-app-text text-xs font-semibold truncate">{s.label}</p>
                                <p className="text-app-subtle text-[10px] truncate">{s.sublabel}</p>
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
            <label className="text-app-subtle text-xs font-semibold tracking-widest">FECHA Y HORA</label>
            <div className="grid grid-cols-1 gap-2">
              <DatePicker value={dateVal} onChange={setDateVal} />
              <TimePicker value={timeVal} onChange={setTimeVal} />
            </div>
          </div>

          {/* Detalle operativo */}
          <div className="flex flex-col gap-2">
            <label className="text-app-subtle text-xs font-semibold tracking-widest">DETALLE OPERATIVO</label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Describa el incidente o motivo de la novedad..."
              rows={4}
              className="w-full bg-app-bg border border-app-border/[0.12] rounded-xl px-4 py-3 text-sm text-app-text placeholder:text-app-faint outline-none focus:border-lime-400/40 transition-colors resize-none"
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
              : "bg-app-card text-app-faint cursor-not-allowed",
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
