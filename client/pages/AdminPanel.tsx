import * as React from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { metricsMock, newsMock } from "@/data/dashboard";
import { novedadesMock, type Novedad } from "@/data/novedades";
import fotoAdmin from "@/assets/foto-admin.jpeg";

/* ─── Types ─────────────────────────────────────────── */

type TabId = "informacion" | "staff" | "finanzas" | "kiosco";

const TABS: { id: TabId; label: string }[] = [
  { id: "informacion", label: "INFORMACIÓN" },
// { id: "staff",       label: "STAFF"        },
  { id: "finanzas",    label: "FINANZAS"      },
//  { id: "kiosco",      label: "KIOSCO"        },
];

/* ─── Novedades helpers ─────────────────────────────── */

const TYPE_CONFIG = {
  incident: { label: "Incidente",    dot: "bg-red-400",   text: "text-red-400"   },
  change:   { label: "Cambio turno", dot: "bg-amber-400", text: "text-amber-400" },
  normal:   { label: "Novedad",      dot: "bg-blue-400",  text: "text-blue-400"  },
};

const STATUS_CONFIG = {
  resolved:    { label: "Resuelto", color: "text-green-400" },
  in_progress: { label: "En curso", color: "text-amber-400" },
  closed:      { label: "Cerrado",  color: "text-app-subtle"  },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
}

const recentNovedades: Novedad[] = [...novedadesMock]
  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  .slice(0, 4);

/* ─── Descuentos ────────────────────────────────────── */

interface Descuento {
  id: string;
  nombre: string;
  descripcion: string;
  porcentaje: number;
  badge: string;
  activo: boolean;
}

const DESCUENTOS_INICIALES: Descuento[] = [
  { id: "dc1", nombre: "Pago en Efectivo",  descripcion: "Descuento por abonar en efectivo.",          porcentaje: 10, badge: "EFECTIVO",  activo: true  },
  { id: "dc2", nombre: "Referido",          descripcion: "Para socios que ingresan por referencia.",    porcentaje: 5,  badge: "REFERIDO",  activo: true  },
  { id: "dc3", nombre: "Socio Antiguo",     descripcion: "Socios con más de 1 año de antigüedad.",      porcentaje: 15, badge: "+1 AÑO",   activo: true  },
  { id: "dc4", nombre: "Cuota Semestral",   descripcion: "Pago anticipado de 6 meses.",                porcentaje: 20, badge: "SEMESTRAL", activo: true  },
  { id: "dc5", nombre: "Primer Mes",        descripcion: "Promoción de bienvenida para nuevos socios.", porcentaje: 25, badge: "BIENVENIDA",activo: false },
];

interface DescuentoFormData {
  nombre: string;
  descripcion: string;
  porcentaje: string;
  badge: string;
  activo: boolean;
}

const EMPTY_DESCUENTO: DescuentoFormData = {
  nombre:      "",
  descripcion: "",
  porcentaje:  "10",
  badge:       "",
  activo:      true,
};

/* ─── Sub-components ────────────────────────────────── */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-app-subtle uppercase tracking-widest">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full px-4 py-2.5 rounded-xl bg-app-input border border-app-input-border text-app-text text-sm placeholder-app-faint outline-none focus:ring-1 focus:ring-lime-400/30 focus:border-lime-400/40 transition-all"
      />
    </div>
  );
}

/* ─── Tab content components ────────────────────────── */

function TabInformacion() {
  return (
    <>
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsMock.map((m) => (
          <div key={m.id} className="bg-app-bg-page rounded-2xl p-5 flex flex-col gap-3 shadow-card glass-border">
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${m.warning ? "bg-red-500/10" : "bg-lime-400/10"}`}>
                <i className={`${m.icon} text-lg ${m.iconColor}`} />
              </div>
              {m.variation && !m.warning && <span className="text-lime-400 text-[10px] font-bold">{m.variation}</span>}
              {m.warning && <span className="text-red-400 text-[10px] font-bold">Action Req</span>}
            </div>
            <div>
              <p className="text-app-subtle text-[10px] font-semibold tracking-widest">{m.label}</p>
              <p className="text-app-text text-2xl font-extrabold mt-0.5">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6 items-start">
        {/* News */}
        <div className="flex flex-col gap-4">
          <h2 className="text-app-text text-sm font-extrabold tracking-wider">NOVEDADES</h2>
          <div className="flex flex-col gap-3">
            {newsMock.map((ev) => (
              <div key={ev.id} className="bg-app-bg-page rounded-2xl p-4 flex items-center gap-4 hover:bg-app-card/50 transition-all duration-150 relative overflow-hidden shadow-card glass-border">
                {ev.urgent && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500/50 rounded-l-2xl" />}
                <div className={`w-9 h-9 rounded-xl ${ev.iconBg} flex items-center justify-center shrink-0`}>
                  <i className={`${ev.icon} text-base ${ev.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-app-text text-sm font-bold">{ev.title}</p>
                  <p className="text-app-subtle text-xs mt-0.5">{ev.description}</p>
                </div>
                <span className="text-app-faint text-[10px] whitespace-nowrap shrink-0">{ev.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="flex flex-col gap-4">
          <h2 className="text-app-text text-sm font-extrabold tracking-wider">HISTORIAL</h2>
          <div className="bg-app-bg-page rounded-2xl shadow-card glass-border flex flex-col overflow-hidden">
            <div className="flex flex-col divide-y divide-app-border/[0.04]">
              {recentNovedades.map((nov) => {
                const type = TYPE_CONFIG[nov.type];
                const status = STATUS_CONFIG[nov.status];
                return (
                  <div key={nov.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-app-hover/[0.02] transition-colors">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${type.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-app-text text-xs font-semibold truncate">{nov.entityName}</p>
                      <p className="text-app-faint text-[10px]">{type.label}</p>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <span className={`text-[10px] font-bold ${status.color}`}>{status.label}</span>
                      <span className="text-app-faint text-[9px]">{timeAgo(nov.timestamp)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 border-t border-app-border/[0.04]">
              <Link
                to="/admin/novedades"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-lime-400 text-black text-xs font-extrabold tracking-wider hover:brightness-110 active:scale-[0.97] transition-all shadow-btn-lime"
              >
                <i className="ti ti-clock-history text-sm" />
                CONSULTAR HISTORIAL
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function TabPlaceholder({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-app-card flex items-center justify-center">
        <i className={`${icon} text-3xl text-app-faint`} />
      </div>
      <div className="text-center">
        <p className="text-app-text text-sm font-bold">{label}</p>
        <p className="text-app-faint text-xs mt-1">Esta sección está en desarrollo.</p>
      </div>
    </div>
  );
}

function TabFinanzas() {
  const [descuentos, setDescuentos] = React.useState<Descuento[]>(DESCUENTOS_INICIALES);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<DescuentoFormData>(EMPTY_DESCUENTO);

  function setField<K extends keyof DescuentoFormData>(key: K, value: DescuentoFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const pct = Math.max(1, Math.min(99, parseInt(form.porcentaje) || 1));
  const canSubmit = form.nombre.trim() !== "" && parseInt(form.porcentaje) >= 1 && parseInt(form.porcentaje) <= 99;

  function handleAdd() {
    const d: Descuento = {
      id: `dc_${Date.now()}`,
      nombre:      form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      porcentaje:  pct,
      badge:       form.badge.trim().toUpperCase() || `${pct}% OFF`,
      activo:      form.activo,
    };
    setDescuentos((prev) => [d, ...prev]);
    setForm(EMPTY_DESCUENTO);
    setModalOpen(false);
  }

  function toggleActivo(id: string) {
    setDescuentos((prev) => prev.map((d) => d.id === id ? { ...d, activo: !d.activo } : d));
  }

  function handleDelete(id: string) {
    setDescuentos((prev) => prev.filter((d) => d.id !== id));
    setDeleteId(null);
  }

  const activos   = descuentos.filter((d) => d.activo).length;
  const inactivos = descuentos.filter((d) => !d.activo).length;

  return (
    <>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: "ti ti-tag",         color: "text-lime-400",   bg: "bg-lime-400/10",   label: "DESCUENTOS ACTIVOS",   value: activos   },
          { icon: "ti ti-tag-off",      color: "text-app-subtle", bg: "bg-app-card",      label: "DESCUENTOS INACTIVOS", value: inactivos },
          { icon: "ti ti-list-details", color: "text-violet-400", bg: "bg-violet-400/10", label: "TOTAL REGISTRADOS",    value: descuentos.length },
        ].map((s) => (
          <div key={s.label} className="bg-app-bg-page rounded-2xl p-5 flex flex-col gap-3 shadow-card glass-border">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
              <i className={`${s.icon} text-lg ${s.color}`} />
            </div>
            <div>
              <p className="text-app-subtle text-[10px] font-semibold tracking-widest">{s.label}</p>
              <p className="text-app-text text-3xl font-extrabold mt-0.5">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Descuentos section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-app-text text-sm font-extrabold tracking-wider">TIPOS DE DESCUENTO</h2>
            <p className="text-app-faint text-xs mt-0.5">Descuentos disponibles al momento de cobrar una cuota.</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-lime-400 text-squat-ink text-xs font-extrabold tracking-wider hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer shadow-btn-lime"
          >
            <i className="ti ti-plus text-sm" />
            AGREGAR DESCUENTO
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {descuentos.map((d) => (
            <div
              key={d.id}
              className={`bg-app-bg-page rounded-2xl px-5 py-4 flex items-center gap-4 shadow-card glass-border transition-opacity ${d.activo ? "" : "opacity-60"}`}
            >
              {/* Percentage circle */}
              <div className="w-12 h-12 rounded-xl bg-lime-400/10 flex flex-col items-center justify-center shrink-0">
                <span className="text-lime-400 text-lg font-extrabold leading-none">{d.porcentaje}%</span>
                <span className="text-lime-400/60 text-[8px] font-bold">OFF</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-app-text text-sm font-bold">{d.nombre}</span>
                  <span className="px-2 py-0.5 rounded-full bg-lime-400/10 text-lime-400 text-[10px] font-bold tracking-wider">
                    {d.badge}
                  </span>
                </div>
                {d.descripcion && (
                  <p className="text-app-subtle text-xs mt-0.5 truncate">{d.descripcion}</p>
                )}
              </div>

              {/* Toggle + delete */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold ${d.activo ? "text-lime-400" : "text-app-faint"}`}>
                    {d.activo ? "ACTIVO" : "INACTIVO"}
                  </span>
                  <button
                    onClick={() => toggleActivo(d.id)}
                    className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${d.activo ? "bg-lime-400" : "bg-app-elevated"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200 ${d.activo ? "left-4" : "left-0.5"}`} />
                  </button>
                </div>

                <button
                  onClick={() => setDeleteId(d.id)}
                  className="p-1.5 rounded-lg text-app-faint hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                >
                  <i className="ti ti-trash text-sm" />
                </button>
              </div>
            </div>
          ))}

          {descuentos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 gap-3 bg-app-bg-page rounded-2xl glass-border">
              <i className="ti ti-tag-off text-3xl text-app-faint" />
              <p className="text-sm text-app-faint font-medium">No hay descuentos registrados</p>
            </div>
          )}
        </div>
      </div>

      {/* Add discount modal */}
      <Dialog open={modalOpen} onOpenChange={(o) => { if (!o) { setForm(EMPTY_DESCUENTO); setModalOpen(false); } }}>
        <DialogContent className="max-w-md bg-app-bg border border-app-border/[0.08] text-app-text">
          <DialogHeader>
            <DialogTitle className="text-app-text text-lg font-extrabold tracking-wider">NUEVO DESCUENTO</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-1">
            <Field
              label="Nombre del descuento *"
              value={form.nombre}
              onChange={(v) => setField("nombre", v)}
              placeholder="Ej: Pago en Efectivo"
            />
            <Field
              label="Descripción"
              value={form.descripcion}
              onChange={(v) => setField("descripcion", v)}
              placeholder="Ej: Descuento por abonar en efectivo"
            />

            {/* Percentage slider */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-app-subtle uppercase tracking-widest">Porcentaje de descuento *</label>
                <span className="text-lime-400 text-lg font-extrabold">{pct}% OFF</span>
              </div>
              <input
                type="range"
                min={1}
                max={99}
                value={pct}
                onChange={(e) => setField("porcentaje", e.target.value)}
                className="w-full accent-lime-400 cursor-pointer"
              />
              <div className="flex justify-between text-app-faint text-[10px]">
                <span>1%</span>
                <span>50%</span>
                <span>99%</span>
              </div>
            </div>

            <Field
              label="Etiqueta / Badge"
              value={form.badge}
              onChange={(v) => setField("badge", v.toUpperCase())}
              placeholder={`Ej: ${pct}% OFF`}
              maxLength={12}
            />

            {/* Active toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-app-card border border-app-input-border">
              <div>
                <p className="text-app-text text-sm font-semibold">Estado inicial</p>
                <p className="text-app-subtle text-xs">¿El descuento estará disponible de inmediato?</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold ${form.activo ? "text-lime-400" : "text-app-faint"}`}>
                  {form.activo ? "ACTIVO" : "INACTIVO"}
                </span>
                <button
                  type="button"
                  onClick={() => setField("activo", !form.activo)}
                  className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${form.activo ? "bg-lime-400" : "bg-app-elevated"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200 ${form.activo ? "left-5" : "left-0.5"}`} />
                </button>
              </div>
            </div>

            {/* Preview */}
            {form.nombre.trim() && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-lime-400/5 border border-lime-400/20">
                <div className="w-10 h-10 rounded-xl bg-lime-400/10 flex flex-col items-center justify-center shrink-0">
                  <span className="text-lime-400 text-sm font-extrabold leading-none">{pct}%</span>
                  <span className="text-lime-400/60 text-[8px] font-bold">OFF</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-app-text text-sm font-bold">{form.nombre.trim()}</span>
                    <span className="px-2 py-0.5 rounded-full bg-lime-400/10 text-lime-400 text-[10px] font-bold">
                      {form.badge.trim() || `${pct}% OFF`}
                    </span>
                  </div>
                  {form.descripcion.trim() && <p className="text-app-subtle text-xs mt-0.5">{form.descripcion.trim()}</p>}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={() => { setForm(EMPTY_DESCUENTO); setModalOpen(false); }}
              className="flex-1 py-2.5 rounded-xl bg-app-card border border-app-input-border text-app-muted text-sm font-semibold hover:bg-app-elevated hover:text-app-text transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleAdd}
              disabled={!canSubmit}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-lime-400 text-squat-ink text-sm font-extrabold hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <i className="ti ti-plus text-sm" />
              Agregar
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm bg-app-bg border border-app-border/[0.08] text-app-text">
          <DialogHeader>
            <DialogTitle className="text-app-text">¿Eliminar descuento?</DialogTitle>
          </DialogHeader>
          <p className="text-app-subtle text-sm mt-1">
            Vas a eliminar{" "}
            <span className="text-app-text font-semibold">
              {descuentos.find((d) => d.id === deleteId)?.nombre}
            </span>. Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setDeleteId(null)}
              className="flex-1 py-2.5 rounded-xl bg-app-card border border-app-input-border text-app-muted text-sm font-semibold hover:bg-app-elevated hover:text-app-text transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={() => deleteId && handleDelete(deleteId)}
              className="flex-1 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-extrabold transition-colors cursor-pointer"
            >
              Eliminar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─── Main component ────────────────────────────────── */

export default function AdminPanel() {
  const [activeTab, setActiveTab] = React.useState<TabId>("informacion");

  return (
    <div className="px-7 pb-7 max-sm:px-4 flex flex-col gap-6">
      {/* Hero Card */}
      <div className="bg-app-bg-page rounded-2xl flex flex-col md:flex-row overflow-hidden shadow-card glass-border">
        <div
          className="w-full md:w-[30%] min-h-[200px] flex items-center justify-center relative bg-cover bg-center"
          style={{ backgroundImage: `url(${fotoAdmin})` }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="flex-1 p-6 md:p-8 flex flex-col gap-4">
          <h1 className="text-app-text text-3xl md:text-4xl font-extrabold">SEDE CENTRAL</h1>
          <div className="flex items-center gap-2">
            <i className="ti ti-map-pin text-lime-400 text-sm" />
            <span className="text-app-muted text-sm">Av. Principal 1234, Distrito Financiero</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lime-400 shadow-[0_0_6px_rgba(163,230,53,0.6)]" />
            <span className="text-lime-400 text-xs font-bold tracking-wider">OPERATIVA</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-app-border/[0.06]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-bold tracking-wider transition-colors cursor-pointer ${
              activeTab === tab.id
                ? "text-lime-400 border-b-2 border-lime-400"
                : "text-app-subtle hover:text-app-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "informacion" && <TabInformacion />}
      {activeTab === "staff"       && <TabPlaceholder icon="ti ti-users"          label="Gestión de Staff" />}
      {activeTab === "finanzas"    && <TabFinanzas />}
      {activeTab === "kiosco"      && <TabPlaceholder icon="ti ti-shopping-cart"  label="Kiosco" />}
    </div>
  );
}
