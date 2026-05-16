import * as React from "react";

const eventTypes = [
  { value: "", label: "Seleccionar categoría..." },
  { value: "incident", label: "Incidente" },
  { value: "change", label: "Cambio de turno" },
  { value: "normal", label: "Novedad general" },
];

export function NovedadesSidebar() {
  const [eventType, setEventType] = React.useState("");
  const [assignment, setAssignment] = React.useState("");
  const [timestamp, setTimestamp] = React.useState("");
  const [detail, setDetail] = React.useState("");

  return (
    <aside className="w-full lg:w-[25%] shrink-0">
      <div className="bg-[#151515] rounded-2xl p-6 md:p-8 flex flex-col gap-6 h-full shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lime-400/10 flex items-center justify-center">
            <i className="ti ti-circle-plus text-xl text-lime-400" />
          </div>
          <h2 className="text-white font-extrabold text-sm tracking-[0.15em]">
            REGISTRAR NOVEDAD
          </h2>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-gray-500 text-xs font-semibold tracking-widest">
              TIPO DE EVENTO
            </label>
            <div className="relative">
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full bg-neutral-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white appearance-none outline-none focus:border-lime-400/40 transition-colors"
              >
                {eventTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <i className="ti ti-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-sm" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-500 text-xs font-semibold tracking-widest">
              ASIGNACION [ENTIDAD]
            </label>
            <div className="relative">
              <input
                type="text"
                value={assignment}
                onChange={(e) => setAssignment(e.target.value)}
                placeholder="Buscar Profesor o Clase..."
                className="w-full bg-neutral-900 border border-zinc-800 rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder:text-gray-600 outline-none focus:border-lime-400/40 transition-colors"
              />
              <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-500 text-xs font-semibold tracking-widest">
              TIMESTAMP (FECHA Y HORA)
            </label>
            <input
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              placeholder="mm/dd/yyyy, --:-- --"
              className="w-full bg-neutral-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none focus:border-lime-400/40 transition-colors [color-scheme:dark]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-500 text-xs font-semibold tracking-widest">
              DETALLE OPERATIVO
            </label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Describa el incidente o motivo de la novedad con precisión técnica..."
              rows={5}
              className="w-full bg-neutral-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none focus:border-lime-400/40 transition-colors resize-none"
            />
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-lime-400 text-black font-extrabold text-sm tracking-wider hover:brightness-110 active:brightness-95 transition-all shadow-[0_0_20px_rgba(163,230,53,0.25)] cursor-pointer">
          <i className="ti ti-bell-ringing text-base" />
          REGISTRAR Y NOTIFICAR
        </button>
      </div>
    </aside>
  );
}
